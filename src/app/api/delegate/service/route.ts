import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import TalentLayerService from '../../../../contracts/ABI/TalentLayerService.json';
import { getServiceSignature } from '../../../../utils/signature';
import { getUserById } from '../../../../queries/users';
import {
  checkOrResetTransactionCounter,
  checkUserEmailVerificationStatus,
  incrementWeeklyTransactionCounter,
} from '../../../utils/email';
import { getPlatformServicePostingFee } from '../../../../queries/platform';

export interface ICreateService {
  chainId: number;
  userId: string;
  userAddress: string;
  cid: string;
  platformId: string;
  signature: `0x${string}` | Uint8Array;
}

/**
 * POST /api/delegate/service
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: ICreateService = await req.json();
  console.log('json', body);
  const config = getConfig(body.chainId);

  if (process.env.NEXT_PUBLIC_ACTIVE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
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
    const user = await getUserById(body.chainId, body.userId);

    if (user) {
      checkUserEmailVerificationStatus(user);

      await Promise.all([
        checkOrResetTransactionCounter(user),
        isPlatformAllowedToDelegate(body.chainId, body.userAddress),
      ]);
    }

    const walletClient = await getDelegationSigner();
    if (!walletClient) {
      return;
    }

    const publicClient = getPublicClient();
    if (!publicClient) {
      return;
    }

    let transaction;

    //TODO: RPC call instead ?
    const platformFeesResponse = await getPlatformServicePostingFee(body.chainId, body.platformId);
    let servicePostingFee = platformFeesResponse?.data?.platform.servicePostingFee;
    servicePostingFee = BigInt(servicePostingFee || '0');

    const signature = await getServiceSignature({ profileId: Number(body.userId), cid: body.cid });

    transaction = await walletClient.writeContract({
      address: config.contracts.serviceRegistry,
      abi: TalentLayerService.abi,
      functionName: 'createService',
      args: [body.userId, body.platformId, body.cid, signature],
      value: servicePostingFee,
    });

    await incrementWeeklyTransactionCounter(user);

    return Response.json({ transaction: transaction }, { status: 201 });
  } catch (error: any) {
    let message = 'Failed to create service';
    return Response.json({ message, error }, { status: 500 });
  }
}
