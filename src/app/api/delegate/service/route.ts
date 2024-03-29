import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import TalentLayerService from '../../../../contracts/ABI/TalentLayerService.json';
import { getServiceSignature } from '../../../../utils/signature';
import { getPlatformPostingFees } from '../../../../queries/platform';
import {
  getUserByAddress,
  getUserByTalentLayerId,
} from '../../../../modules/BuilderPlace/actions/user';
import { ERROR_EMAIL_NOT_VERIFIED } from '../../../../modules/BuilderPlace/apiResponses';
import {
  checkOrResetTransactionCounter,
  incrementWeeklyTransactionCounter,
} from '../../../utils/email';

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
  const { chainId, userId, userAddress, cid, platformId, signature } = body;

  const config = getConfig(chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

  // @TODO: move it to a middleware and apply to all POST and PUT ?
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${userAddress}`,
    signature: signature,
  });

  const user = await getUserByAddress(signatureAddress);

  if (user?.talentLayerId !== userId) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const user = await getUserByTalentLayerId(userId);

    if (user) {
      if (!user.isEmailVerified) {
        console.log('Email not verified');
        return Response.json({ error: ERROR_EMAIL_NOT_VERIFIED }, { status: 401 });
      }

      await checkOrResetTransactionCounter(user);
      const canDelegate = await isPlatformAllowedToDelegate(chainId, userAddress);

      if (!canDelegate) {
        Response.json({ error: 'Delegation is Not activated for this address' }, { status: 401 });
      }

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

      let transaction;

      //TODO: V2 - RPC call instead ?
      const platformFeesResponse = await getPlatformPostingFees(chainId, platformId);
      let servicePostingFee = platformFeesResponse?.data?.data?.platform.servicePostingFee;
      servicePostingFee = BigInt(Number(servicePostingFee) || '0');

      const signature = await getServiceSignature({
        profileId: Number(userId),
        cid: cid,
      });

      console.log('Creating service with args', userId, platformId, cid, signature);

      transaction = await walletClient.writeContract({
        address: config.contracts.serviceRegistry,
        abi: TalentLayerService.abi,
        functionName: 'createService',
        args: [userId, platformId, cid, signature],
        value: servicePostingFee,
      });

      await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to create service';
    return Response.json({ message, error }, { status: 500 });
  }
}
