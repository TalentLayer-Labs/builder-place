import { recoverMessageAddress } from 'viem';
import { User } from '.prisma/client';
import { getPlatformBy } from '../../modules/BuilderPlace/actions/builderPlace';

/**
 * Checks if the signature is from a BuilderPlace collaborator by getting the BuilderPlace
 * by the collaborator address & BuilderPlace Database id
 * @param id Database BuilderPlace id
 * @param signature Signature to verify
 */
export const checkSignature = async (id: string, signature: `0x${string}` | Uint8Array) => {
  try {
    const address = await recoverMessageAddress({
      message: id,
      signature: signature,
    });

    const builderPlace = await getPlatformBy({
      id: Number(id),
    });

    if (!builderPlace?.collaborators.some(collaborator => collaborator.address === address)) {
      return Response.json({ error: 'No BuilderPlace found' }, { status: 400 });
    }

    return { builderPlace, address };
  } catch (error) {
    console.error('Error in checkSignature:', error);

    return Response.json(
      { error: 'An error occurred while verifying the signature' },
      { status: 500 },
    );
  }
};

/**
 * Checks if the signature is from the BuilderPlace owner by getting the BuilderPlace
 * by the owner address & BuilderPlace Database id
 * @param builderPlaceId Database BuilderPlace id
 * @param signature Signature to verify
 * @param address Address to verify
 * @throws 401 if the signature is not from the BuilderPlace owner
 */
export const checkOwnerSignature = async (
  builderPlaceId: string,
  signature: `0x${string}` | Uint8Array,
  address: `0x${string}`,
) => {
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${address}`,
    signature: signature,
  });

  const builderPlace = await getPlatformBy({
    id: Number(builderPlaceId),
  });

  /**
   * Check whether the signature is from the BuilderPlace owner
   */
  if (builderPlace && signatureAddress.toLocaleLowerCase() !== builderPlace?.owner?.address) {
    throw new Error('Not Platform Owner');
  }

  return { builderPlace, address: signatureAddress };
};

export const isCollaboratorExists = (
  collaborators: User[] = [],
  newCollaboratorAddress: string,
): boolean => {
  console.log(
    'collaborators',
    collaborators.map(collaborator => {
      console.log(collaborator.address);
    }),
  );
  console.log('newCollaboratorAddress', newCollaboratorAddress);
  return collaborators.some(
    collaborator =>
      collaborator?.address?.toLocaleLowerCase() === newCollaboratorAddress.toLocaleLowerCase(),
  );
};
