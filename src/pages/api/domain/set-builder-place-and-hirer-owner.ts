import { NextApiRequest, NextApiResponse } from 'next';
import {
  getBuilderPlaceById,
  getBuilderPlaceByOwnerTalentLayerId,
  getUserByAddress,
  getUserById,
  setBuilderPlaceOwner,
  setUserOwner,
} from '../../../modules/BuilderPlace/actions';
import { SetBuilderPlaceAndHirerOwner } from '../../../modules/BuilderPlace/types';
import { EntityStatus } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: SetBuilderPlaceAndHirerOwner = req.body;
    console.log('Received data:', body);

    if (!body.builderPlaceId || !body.hirerId || !body.ownerAddress || !body.ownerTalentLayerId) {
      return res.status(400).json({ error: 'Missing data.' });
    }

    /**
     * @dev: Checks on the domain
     */
    const existingSpace = await getBuilderPlaceByOwnerTalentLayerId(body.ownerTalentLayerId);
    if (existingSpace) {
      return res.status(401).json({ error: 'You already own a domain' });
    }

    const builderSpace = await getBuilderPlaceById(body.builderPlaceId as string);
    if (!builderSpace) {
      return res.status(400).json({ error: "Domain doesn't exist." });
    }

    if (!!builderSpace.ownerId || !!builderSpace.owner) {
      return res.status(401).json({ error: 'Domain already taken.' });
    }

    /**
     * Checks on the Hirer
     * @dev: We check by address and status as it's the only proof that a user signed a message
     * with this address to validate this profile. If the status is not validated we create a new profile.
     */
    const existingProfile = await getUserByAddress(body.ownerAddress);
    if (
      existingProfile &&
      existingProfile.status === EntityStatus.VALIDATED &&
      !!existingProfile.ownedBuilderPlace
    ) {
      return res.status(401).json({ error: 'You already have a profile' });
    }

    const userProfile = await getUserById(body.hirerId as string);
    if (!userProfile) {
      return res.status(400).json({ error: "Profile doesn't exist." });
    }
    if (!!userProfile.talentLayerId) {
      return res.status(401).json({ error: 'Profile already has an owner.' });
    }

    try {
      /**
       * @dev: Update BuilderPlace & Hirer profile
       */
      const builderPlaceResponse = await setBuilderPlaceOwner({
        id: body.builderPlaceId,
        // ownerAddress: body.ownerAddress,
        ownerId: body.hirerId,
      });

      const userResponse = await setUserOwner({
        id: body.hirerId,
        hirerAddress: body.ownerAddress,
        talentLayerId: body.ownerTalentLayerId,
      });

      res.status(200).json({
        message: 'BuilderPlace domain & Hirer profile updated successfully',
        builderPlaceId: builderPlaceResponse.id,
        hirerId: userResponse.id,
      });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
