import { IRemoveBuilderPlaceCollaborator } from '../../../pages/[domain]/admin/collaborator-card';
import { checkOwnerSignature, isCollaboratorExists } from '../../utils/domain';
import { EntityStatus, User } from '.prisma/client';
import prisma from '../../../postgre/postgreClient';
import { handleApiError } from '../../utils/handleApiErrors';
import {
  COLLABORATOR_NOT_FOUND,
  ERROR_ADDING_COLLABORATOR,
  ERROR_REMOVING_BUILDERPLACE_OWNER,
  USER_NOT_FOUND,
  USER_PROFILE_NOT_VERIFIED,
} from '../../../modules/BuilderPlace/apiResponses';

export async function POST(req: Request) {
  console.log('POST');
  const body: IRemoveBuilderPlaceCollaborator = await req.json();
  console.log('json', body);

  try {
    const response = await checkOwnerSignature(
      body.data.builderPlaceId,
      body.data.ownerTalentLayerId,
      body.signature,
      body.address,
    );

    console.log('response', response instanceof Response);

    if (response instanceof Response) {
      return response;
    }

    /**
     * @dev: Check whether the collaborator exists
     */
    const existingCollaborators: User[] = response?.builderPlace?.collaborators || [];

    if (isCollaboratorExists(existingCollaborators, body.data.collaboratorAddress)) {
      console.log('Collaborator already exists');
      return Response.json({ error: 'Already a collaborator' }, { status: 400 });
    }

    console.log('Adding collaborator', body.data.collaboratorAddress);

    let errorMessage = ERROR_ADDING_COLLABORATOR;
    let status = 500;
    let collaborator: User | null = null;

    try {
      const newCollaborator = await prisma.user.findUnique({
        where: {
          address: body.data.collaboratorAddress,
        },
      });

      if (!newCollaborator) {
        errorMessage = USER_NOT_FOUND;
        throw new Error(USER_NOT_FOUND);
      }

      //TODO still useful?
      if (newCollaborator?.status === EntityStatus.PENDING) {
        errorMessage = USER_PROFILE_NOT_VERIFIED;
        throw new Error(USER_PROFILE_NOT_VERIFIED);
      }

      await prisma.builderPlace.update({
        where: {
          id: Number(body.data.builderPlaceId),
        },
        data: {
          collaborators: {
            connect: [{ id: newCollaborator.id }],
          },
        },
      });

      console.log('Collaborator added successfully', body.data.collaboratorAddress);
    } catch (error: any) {
      handleApiError(error, errorMessage, status);
    }

    return Response.json(
      {
        message: 'Collaborator added successfully',
        // address: newCollaborator?.address,
        // id: newCollaborator?.id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
