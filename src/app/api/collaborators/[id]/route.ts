import { IRemoveBuilderPlaceCollaborator } from '../../../../pages/[domain]/admin/collaborator-card';
import { removeBuilderPlaceCollaborator } from '../../../../modules/BuilderPlace/actions/builderPlace';
import { User } from '.prisma/client';
import { checkOwnerSignature, isCollaboratorExists } from '../../../utils/domain';
import prisma from '../../../../postgre/postgreClient';
import { ERROR_REMOVING_BUILDERPLACE_OWNER } from '../../../../modules/BuilderPlace/apiResponses';
import { handleApiError } from '../../../utils/handleApiErrors';

export async function GET(req: Request) {}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IRemoveBuilderPlaceCollaborator = await req.json();
  console.log('params', params);
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
     * @dev: Check whether the collaborator is not the BuilderPlace owner
     */
    if (response?.builderPlace?.owner?.address === body.data.collaboratorAddress) {
      console.log('Cant remove the owner as a collaborator');
      return Response.json({ error: 'Restricted access' }, { status: 400 });
    }

    /**
     * @dev: Check whether the collaborator exists
     */
    const existingCollaborators: User[] = response?.builderPlace?.collaborators || [];

    if (!isCollaboratorExists(existingCollaborators, body.data.collaboratorAddress)) {
      console.log('Collaborator does not exist');
      return Response.json({ error: 'Not a collaborator' }, { status: 400 });
    }

    console.log('Removing collaborator', body.data.collaboratorAddress);

    let status = 500;
    let collaborator: User | null = null;

    try {
      collaborator = await prisma.user.findUnique({
        where: {
          address: body.data.collaboratorAddress,
        },
      });

      if (!collaborator) {
        status = 400;
        throw new Error('Collaborator not found');
      }

      await prisma.builderPlace.update({
        where: {
          id: Number(body.data.builderPlaceId),
        },
        data: {
          collaborators: {
            disconnect: [{ id: collaborator.id }],
          },
        },
      });

      console.log('Collaborator removed successfully', body.data.collaboratorAddress);
    } catch (error: any) {
      handleApiError(error, ERROR_REMOVING_BUILDERPLACE_OWNER, status);
    }

    return Response.json(
      {
        message: 'Collaborator removed successfully',
        address: collaborator?.address,
        id: collaborator?.id,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
