import { recoverMessageAddress } from 'viem';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { getConfig } from '../../../../config';
import { getDelegationSigner, getPublicClient } from '../../../utils/delegate';
import TalentLayerID from '../../../../contracts/ABI/TalentLayerID.json';

export interface IUserMintForAddress {
  chainId: number;
  handle: string;
  handlePrice: string;
  userAddress: string;
  signature: `0x${string}` | Uint8Array;
  addDelegateAndTransferId?: boolean;
}

/**
 * POST /api/delegate/user
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IUserMintForAddress = await req.json();
  console.log('json', body);
  const config = getConfig(body.chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_MINT !== 'true') {
    return Response.json({ message: 'Delegation for Mint is not activated' }, { status: 500 });
  }

  // @TODO: move it to a middleware and apply to all POST and PUT ?
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.userAddress}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.userAddress) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const walletClient = await getDelegationSigner();
    if (!walletClient) {
      return;
    }

    const publicClient = getPublicClient();
    if (!publicClient) {
      return;
    }

    let transaction, userId;

    /**
     * If addDelegateAndTransferId is true, we mint the TlId for the user, add the delegator address as delegate, then transfer it to them.
     * @dev: This requires the delegator address not to have an existing TlId.
     */
    if (body.addDelegateAndTransferId) {
      const tx = await walletClient.writeContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'mint',
        args: [process.env.NEXT_PUBLIC_PLATFORM_ID, body.handle],
        value: BigInt(body.handlePrice),
      });

      console.log(`Minted TalentLayer Id for address ${body.userAddress}`);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log('Mint Transaction Status', receipt.status);

      // Get Minted UserId
      userId = await publicClient.readContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'ids',
        args: [walletClient.account.address],
      });

      console.log(`Minted id: ${userId} for user ${body.userAddress}`);

      // Add delegate
      const delegateTxHash = await walletClient.writeContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'addDelegate',
        args: [userId, walletClient.account.address],
      });

      console.log(
        `Adding ${walletClient.account.address} as delegate for user ${userId}, waiting for block confirmation...`,
      );

      await publicClient.waitForTransactionReceipt({
        confirmations: 1,
        hash: delegateTxHash,
      });

      console.log(`Delegate Added`);

      // Transfer TlId to user
      transaction = await walletClient.writeContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'safeTransferFrom',
        args: [walletClient.account.address, body.userAddress, userId],
      });

      console.log(`Transferred TalentLayer Id ${userId} to address ${body.userAddress}`);
    } else {
      transaction = await walletClient.writeContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'mintForAddress',
        args: [body.userAddress, process.env.NEXT_PUBLIC_PLATFORM_ID, body.handle],
        value: BigInt(body.handlePrice),
      });

      console.log(`Minted TalentLayer Id for address ${body.userAddress}`);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: transaction });
      console.log('Mint Transaction Status', receipt.status);

      // Get Minted UserId
      userId = await publicClient.readContract({
        address: config.contracts.talentLayerId,
        abi: TalentLayerID.abi,
        functionName: 'ids',
        args: [body.userAddress],
      });

      console.log(`Minted id: ${userId} for user ${body.userAddress}`);
    }

    return Response.json({ transaction: transaction, userId: String(userId) }, { status: 201 });
  } catch (error: any) {
    // @TODO: move error handle to a middleware ? or factorize it ?
    let message = 'Failed to mint ID';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A platform already exists with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
