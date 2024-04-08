import { checkOwnerSignature, isCollaboratorExists } from '../../utils/domain';
import { EntityStatus, User } from '.prisma/client';
import prisma from '../../../postgre/postgreClient';
import { logAndReturnApiError } from '../../utils/handleApiErrors';
import {
  COLLABORATOR_ALREADY_EXISTS,
  COLLABORATOR_NOT_FOUND,
  ERROR_ADDING_COLLABORATOR,
  USER_PROFILE_NOT_VERIFIED,
} from '../../../modules/BuilderPlace/apiResponses';
import { IAddBuilderPlaceCollaborator } from '../../../components/Form/CollaboratorForm';

/**
 * POST /api/collaborators/
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IAddBuilderPlaceCollaborator = await req.json();
  console.log('json', body);

  try {
    const response = await checkOwnerSignature(
      body.data.builderPlaceId,
      body.signature,
      body.address,
    );

    const existingCollaborators: User[] = response?.builderPlace?.collaborators || [];

    if (isCollaboratorExists(existingCollaborators, body.data.collaboratorAddress)) {
      console.log(COLLABORATOR_ALREADY_EXISTS);
      return Response.json({ error: COLLABORATOR_ALREADY_EXISTS }, { status: 400 });
    }

    const newCollaborator = await prisma.user.findUnique({
      where: {
        address: body.data.collaboratorAddress,
      },
    });

    if (!newCollaborator) {
      console.log(COLLABORATOR_NOT_FOUND);
      return Response.json({ error: COLLABORATOR_NOT_FOUND }, { status: 400 });
    }

    if (newCollaborator?.status === EntityStatus.PENDING) {
      console.log(USER_PROFILE_NOT_VERIFIED);
      return Response.json({ error: USER_PROFILE_NOT_VERIFIED }, { status: 400 });
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

    return Response.json(
      {
        message: 'Collaborator added successfully',
        address: newCollaborator?.address,
        id: newCollaborator?.id,
      },
      { status: 200 },
    );
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_ADDING_COLLABORATOR);
    return Response.json({ error: error }, { status: 500 });
  }
}
