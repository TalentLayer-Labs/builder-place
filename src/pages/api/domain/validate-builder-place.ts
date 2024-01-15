import { NextApiRequest, NextApiResponse } from 'next';
import {
  getBuilderPlaceById,
  getUserById,
  updateBuilderPlace,
  validateBuilderPlace,
  validateUser,
} from '../../../modules/BuilderPlace/actions';
import { ValidateBuilderPlaceAndOwner } from '../../../modules/BuilderPlace/types';
import { recoverMessageAddress } from 'viem';
import { EntityStatus } from '.prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: ValidateBuilderPlaceAndOwner = req.body;
    console.log('Received data:', body);

    if (!body.builderPlaceId || !body.ownerId || !body.ownerAddress || !body.signature) {
      return res.status(400).json({ error: 'Missing data.' });
    }

    const ownerAddress = await recoverMessageAddress({
      message: body.builderPlaceId.toString(),
      signature: body.signature,
    });

    /**
     * @dev: Check whether the user exists in the database & is the owner of the address
     */
    const owner = await getUserById(body.ownerId);

    if (owner?.address.toLocaleLowerCase() !== ownerAddress.toLocaleLowerCase()) {
      return res.status(401).json({ error: 'Restricted access' });
    }

    if (owner.status === EntityStatus.VALIDATED) {
      return res.status(400).json({ error: 'Profile already validated' });
    }

    /**
     * @dev: Check whether the BuilderPlace exists in the database & has no owner
     */
    const builderSpace = await getBuilderPlaceById(body.builderPlaceId);
    if (!builderSpace) {
      return res.status(400).json({ error: "Domain doesn't exist" });
    }

    if (builderSpace.ownerId !== owner.id) {
      return res.status(401).json({ error: 'Wrong BuilderPlace' });
    }

    if (builderSpace.status === EntityStatus.VALIDATED) {
      return res.status(401).json({ error: 'Domain already has an owner' });
    }

    try {
      /**
       * @dev: Validate & Update BuilderPlace & Hirer profile
       */
      await validateUser(body.ownerId);
      await validateBuilderPlace(body.builderPlaceId);

      /**
       * @dev: Update BuilderPlace
       */
      await updateBuilderPlace({
        builderPlaceId: body.builderPlaceId,
        subdomain: body.subdomain,
        logo: body.logo,
        palette: body.palette,
        signature: body.signature,
      });

      res.status(200).json({
        message: 'BuilderPlace domain & Hirer profile updated successfully',
        builderPlaceId: body.builderPlaceId,
        hirerId: body.ownerId,
      });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
