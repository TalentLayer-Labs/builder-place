import { NextApiRequest, NextApiResponse } from 'next';
import { RemoveBuilderPlaceCollaborator } from '../../../modules/BuilderPlace/types';
import { checkOwnerSignature, isCollaboratorExists } from '../utils/domain';
import { User } from '.prisma/client';
import { removeBuilderPlaceCollaborator } from '../../../modules/BuilderPlace/actions/builderPlace';
import { METHOD_NOT_ALLOWED } from '../../../modules/BuilderPlace/apiResponses';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: METHOD_NOT_ALLOWED });
  }

  const body: RemoveBuilderPlaceCollaborator = req.body;
  console.log('Received data:', body);

  try {
    const response = await checkOwnerSignature(
      body.builderPlaceId,
      body.ownerId,
      body.signature,
      res,
    );

    /**
     * @dev: Check whether the collaborator is not the BuilderPlace owner
     */
    if (
      response?.builderPlace?.owner?.address?.toLocaleLowerCase() ===
      body.collaboratorAddress.toLocaleLowerCase()
    ) {
      return res.status(400).json({ error: 'Restricted access' });
    }

    /**
     * @dev: Check whether the collaborator exists
     */
    const existingCollaborators: User[] = response?.builderPlace?.collaborators || [];

    if (!isCollaboratorExists(existingCollaborators, body.collaboratorAddress)) {
      return res.status(400).json({ error: 'Not a collaborator' });
    }

    const result = await removeBuilderPlaceCollaborator(body);
    res.status(200).json({ message: result?.message, address: result?.address, id: result?.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
