import { NextApiRequest, NextApiResponse } from 'next';
import {
  getBuilderPlaceById,
  getBuilderPlaceByOwnerTalentLayerId,
  getUserByAddress,
  getUserById,
  removeOwnerFromUser,
  removeBuilderPlaceOwner,
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
    if (existingSpace && existingSpace.status === EntityStatus.VALIDATED) {
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
     * @dev: If PENDING profiles with the same address and / or TalentLayerId, remove address & ID
     * from pending profile to avoid conflicts on "unique" constraints
     */
    const existingProfileWithSameAddress = await getUserByAddress(body.ownerAddress);
    if (
      existingProfileWithSameAddress &&
      existingProfileWithSameAddress.status === EntityStatus.VALIDATED &&
      !!existingProfileWithSameAddress.ownedBuilderPlace
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
    if (!!userProfile.talentLayerId && userProfile.status === EntityStatus.VALIDATED) {
      return res.status(401).json({ error: 'Profile already has an owner.' });
    }

    try {
      /**
       * @dev: If existing pending with same address,
       * remove address from pending profile to avoid conflicts on field "unique" constraint
       */
      if (
        existingProfileWithSameAddress &&
        existingProfileWithSameAddress.status === EntityStatus.PENDING
      ) {
        //TODO carrément suppr le user ?
        await removeOwnerFromUser(existingProfileWithSameAddress.id.toString());
      }

      /**
       * @dev: Update BuilderPlace & Hirer profile
       */
      await setUserOwner({
        id: body.hirerId,
        userAddress: body.ownerAddress.toLocaleLowerCase(),
        talentLayerId: talentLayerUser.id,
      });

      /**
       * @dev: Remove owner from pending domain to avoid conflicts on field "unique" constraint
       */
      if (existingSpace && existingSpace.ownerId && existingSpace.status === EntityStatus.PENDING) {
        await removeBuilderPlaceOwner({
          id: existingSpace.id,
          ownerId: existingSpace.ownerId,
        });
      }

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
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
