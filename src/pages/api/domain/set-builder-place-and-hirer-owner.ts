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
import { EntityStatus } from '.prisma/client';
import { getUserByAddress as getTalentLayerUserByAddress } from '../../../queries/users';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: SetBuilderPlaceAndHirerOwner = req.body;
    console.log('Received data:', body);

    if (!body.builderPlaceId || !body.hirerId || !body.ownerAddress || !body.ownerTalentLayerId) {
      return res.status(400).json({ error: 'Missing data.' });
    }

    if (!process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) {
      return res.status(500).json({ error: 'Missing default chain config.' });
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

    // **** Checks on the Hirer ****

    /**
     * Check whether the provided address owns a TalentLayer Id
     */
    const response = await getTalentLayerUserByAddress(
      Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID),
      body.ownerAddress,
    );

    const talentLayerUser = response?.data?.data?.users[0];

    if (!talentLayerUser) {
      return res.status(401).json({ error: 'Your address does not own a TalentLayer Id' });
    }

    /**
     * @notice: Check whether the user already owns a profile
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

    /**
     * @dev: Checks whether the user exists in the database
     */
    const userProfile = await getUserById(body.hirerId as string);
    if (!userProfile) {
      return res.status(400).json({ error: "Profile doesn't exist." });
    }
    if (!!userProfile.talentLayerId || userProfile.status === EntityStatus.VALIDATED) {
      return res.status(401).json({ error: 'Profile already has an owner.' });
    }

    try {
      /**
       * @dev: Update BuilderPlace & Hirer profile
       */
      await setUserOwner({
        id: body.hirerId,
        hirerAddress: body.ownerAddress,
        hirerTalentLayerId: talentLayerUser.id,
      });

      await setBuilderPlaceOwner({
        id: body.builderPlaceId,
        ownerId: body.hirerId,
      });

      res.status(200).json({
        message: 'BuilderPlace domain & Hirer profile updated successfully',
        builderPlaceId: body.builderPlaceId,
        hirerId: body.hirerId,
      });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
