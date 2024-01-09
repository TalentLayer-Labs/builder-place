import { recoverMessageAddress } from 'viem';
import {
  getBuilderPlaceByCollaboratorAddressAndId,
  getBuilderPlaceByOwnerTlIdAndId,
} from '../../../modules/BuilderPlace/actions';
import { NextApiResponse } from 'next';

/**
 * Checks if the signature is from a BuilderPlace collaborator by getting the BuilderPlace
 * by the collaborator address & BuilderPlace Database id
 * @param id: Database BuilderPlace id
 * @param signature
 * @param res
 */
export const checkSignature = async (
  id: string,
  signature: `0x${string}` | Uint8Array,
  res: NextApiResponse,
) => {
  const address = await recoverMessageAddress({
    message: id,
    signature: signature,
  });

  const builderPlace = await getBuilderPlaceByCollaboratorAddressAndId(address, id);

  if (!builderPlace) {
    return res.status(400).json({ error: 'No BuilderPlace found.' });
  }

  return { builderPlace, address };
};

/**
 * Checks if the signature is from the BuilderPlace owner by getting the BuilderPlace
 * by the owner DataBase id & BuilderPlace Database id
 * @param builderPlaceId: Database BuilderPlace id
 * @param ownerId: Database BuilderPlace owner id
 * @param signature
 * @param res
 * @throws 401 if the signature is not from the BuilderPlace owner
 */
export const checkOwnerSignature = async (
  builderPlaceId: string,
  ownerId: string,
  signature: `0x${string}` | Uint8Array,
  res: NextApiResponse,
) => {
  const address = await recoverMessageAddress({
    message: ownerId,
    signature: signature,
  });

  const builderPlace = await getBuilderPlaceByOwnerTlIdAndId(ownerId, builderPlaceId);

  if (builderPlace && address !== builderPlace?.owner?.address) {
    return res.status(401).json({ error: 'Not BuilderPlace owner' });
  }

  return { builderPlace, address };
};
