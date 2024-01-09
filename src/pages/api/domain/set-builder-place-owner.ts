import { NextApiRequest, NextApiResponse } from 'next';
import {
  getBuilderPlaceById,
  getBuilderPlaceByOwnerId,
  setBuilderPlaceOwner,
} from '../../../modules/BuilderPlace/actions';
import { SetBuilderPlaceOwner } from '../../../modules/BuilderPlace/types';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: SetBuilderPlaceOwner = req.body;
    console.log('Received data:', body);
    if (!body.id || !body.owners || !body.ownerTalentLayerId) {
      return res.status(500).json({ error: 'Missing data.' });
    }

    /**
     * @dev: Check whether the user already owns a domain
     */
    const existingSpace = await getBuilderPlaceByOwnerId(body.ownerTalentLayerId);
    if (existingSpace) {
      return res.status(500).json({ error: 'You already own a domain' });
    }

    /**
     * @dev: Check whether the domain exists
     */
    const builderSpace = await getBuilderPlaceById(body.id as string);
    if (!builderSpace) {
      return res.status(500).json({ error: "Domain doesn't exist." });
    }
    if (builderSpace.collaborators.length !== 0 || !!builderSpace.owner || !!builderSpace.ownerId) {
      return res.status(500).json({ error: 'Domain already taken.' });
    }

    try {
      /**
       * @dev: Set domain's owner
       */
      const { message, id } = await setBuilderPlaceOwner(body);
      res.status(200).json({ message: message, ownerTlId: id });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
