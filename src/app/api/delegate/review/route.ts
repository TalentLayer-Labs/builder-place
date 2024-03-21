import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import { checkUserEmailVerificationStatus } from '../../../utils/email';
import { getUserByTalentLayerId } from '../../../../modules/BuilderPlace/actions/user';
import TalentLayerReview from '../../../../contracts/ABI/TalentLayerReview.json';

export interface IReview {
  serviceId: string;
  cid: string;
  userAddress: string;
  userId: string;
  rating: number;
  chainId: number;
  signature: `0x${string}` | Uint8Array;
}

/**
 * POST /api/delegate/review
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IReview = await req.json();
  console.log('json', body);
  const { serviceId, cid, rating, userAddress, userId, chainId, signature } = body;

  console.log('userId', userId);

  const config = getConfig(chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${userAddress}`,
    signature: signature,
  });

  if (signatureAddress !== userAddress) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const user = await getUserByTalentLayerId(userId);

    if (user) {
      // return checkUserEmailVerificationStatus(user);
      const emailResponse = checkUserEmailVerificationStatus(user);

      if (emailResponse) {
        return emailResponse;
      }

      const responses = await Promise.all([
        //TODO problem with database value: need to switch to date => Bigint Not serializable
        // checkOrResetTransactionCounter(user),
        isPlatformAllowedToDelegate(chainId, userAddress),
      ]);

      if (responses[0]) {
        return responses[0];
      }

      const walletClient = await getDelegationSigner();
      if (!walletClient) {
        return;
      }

      const publicClient = getPublicClient();
      if (!publicClient) {
        return;
      }

      const transaction = await walletClient.writeContract({
        address: config.contracts.talentLayerReview,
        abi: TalentLayerReview.abi,
        functionName: 'mint',
        args: [userId, serviceId, cid, rating],
      });

      // await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to record review';
    return Response.json({ message, error }, { status: 500 });
  }
}
