import { recoverMessageAddress } from 'viem';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import TalentLayerPlatformID from '../../../../contracts/ABI/TalentLayerPlatformID.json';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import { getUserByAddress } from '../../../../modules/BuilderPlace/actions/user';

export interface IPlatformMintForAddress {
  platformName: string;
  address: string;
  userTalentLayerId: string;
  chainId: number;
  signature: `0x${string}` | Uint8Array;
}

/**
 * POST /api/delegate/platform
 * @note: The delegate address executing the mint function needs to have the MINT_ROLE
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IPlatformMintForAddress = await req.json();
  console.log('json', body);
  const config = getConfig(body.chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

  // @TODO: move it to a middleware and apply to all POST and PUT ?
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  const user = await getUserByAddress(signatureAddress);

  if (user?.talentLayerId !== body.userTalentLayerId) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const walletClient = await getDelegationSigner();
    if (!walletClient) {
      console.log('Wallet client not found');
      return Response.json({ error: 'Server Error' }, { status: 500 });
    }

    const publicClient = getPublicClient();
    if (!publicClient) {
      console.log('Public client not found');
      return Response.json({ error: 'Server Error' }, { status: 500 });
    }

    const mintFee = await publicClient.readContract({
      address: config.contracts.talentLayerPlatformId,
      abi: TalentLayerPlatformID.abi,
      functionName: 'mintFee',
    });

    console.log('MintFee', mintFee);

    const txHash = await walletClient.writeContract({
      address: config.contracts.talentLayerPlatformId,
      abi: TalentLayerPlatformID.abi,
      functionName: 'mintForAddress',
      args: [body.platformName, body.address],
      value: mintFee as bigint,
    });

    console.log('tx hash', txHash);

    await publicClient.waitForTransactionReceipt({
      confirmations: 1,
      hash: txHash,
    });

    const id = await publicClient.readContract({
      address: config.contracts.talentLayerPlatformId,
      abi: TalentLayerPlatformID.abi,
      functionName: 'ids',
      args: [body.address],
    });

    console.log('Platform id', id);

    const platformId = id as unknown as string;

    return Response.json({ transaction: txHash, platformId: String(platformId) }, { status: 201 });
  } catch (error: any) {
    // @TODO: move error handle to a middleware ? or factorize it ?
    let message = 'Failed to create plaform';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A platform already exists with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
