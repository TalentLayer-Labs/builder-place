import { IRemoveBuilderPlaceCollaborator } from '../../../../pages/[domain]/admin/collaborator-card';
import { User } from '.prisma/client';
import { checkOwnerSignature, isCollaboratorExists } from '../../../utils/domain';
import prisma from '../../../../postgre/postgreClient';
import {
  COLLABORATOR_NOT_FOUND,
  ERROR_REMOVING_BUILDERPLACE_OWNER,
} from '../../../../modules/BuilderPlace/apiResponses';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';

/**
 * GET /api/collaborators/
 */
export async function GET() {}

/**
 * PUT /api/collaborators/
 */
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
      console.log(COLLABORATOR_NOT_FOUND);
      return Response.json({ error: COLLABORATOR_NOT_FOUND }, { status: 400 });
    }

    console.log('Removing collaborator', body.data.collaboratorAddress);

    let collaborator: User | null;

    collaborator = await prisma.user.findUnique({
      where: {
        address: body.data.collaboratorAddress,
      },
    });

    if (!collaborator) {
      console.log(COLLABORATOR_NOT_FOUND);
      return Response.json({ error: COLLABORATOR_NOT_FOUND }, { status: 400 });
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

    return Response.json(
      {
        message: 'Collaborator removed successfully',
        address: collaborator?.address,
        id: collaborator?.id,
      },
      { status: 200 },
    );
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_REMOVING_BUILDERPLACE_OWNER);
    return Response.json({ error: error }, { status: 500 });
  }
}
