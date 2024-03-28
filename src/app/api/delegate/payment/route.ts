import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import { checkUserEmailVerificationStatus } from '../../../utils/email';
import {
  getUserByAddress,
  getUserByTalentLayerId,
} from '../../../../modules/BuilderPlace/actions/user';
import TalentLayerEscrow from '../../../../contracts/ABI/TalentLayerEscrow.json';

export interface IExecutePayment {
  chainId: number;
  userAddress: string;
  userId: string;
  transactionId: number;
  amount: string;
  isBuyer: boolean;
  signature: `0x${string}` | Uint8Array;
}

/**
 * POST /api/delegate/payment
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IExecutePayment = await req.json();
  console.log('json', body);
  const { chainId, userId, userAddress, amount, isBuyer, transactionId, signature } = body;

  const config = getConfig(chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

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

      let transaction;

      if (isBuyer) {
        transaction = await walletClient.writeContract({
          address: config.contracts.talentLayerEscrow,
          abi: TalentLayerEscrow.abi,
          functionName: 'release',
          args: [userId, transactionId, amount],
        });
      } else {
        transaction = await walletClient.writeContract({
          address: config.contracts.talentLayerEscrow,
          abi: TalentLayerEscrow.abi,
          functionName: 'reimburse',
          args: [userId, transactionId, amount],
        });
      }

      // await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to execute payment';
    return Response.json({ message, error }, { status: 500 });
  }
}
