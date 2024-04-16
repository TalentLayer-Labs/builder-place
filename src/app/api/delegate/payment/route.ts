import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import {
  getUserByAddress,
  getUserByTalentLayerId,
} from '../../../../modules/BuilderPlace/actions/user';
import TalentLayerEscrow from '../../../../contracts/ABI/TalentLayerEscrow.json';
import { ERROR_EMAIL_NOT_VERIFIED } from '../../../../modules/BuilderPlace/apiResponses';
import {
  checkOrResetTransactionCounter,
  incrementWeeklyTransactionCounter,
} from '../../../utils/email';
import { initializeTalentLayerClient } from '../../../../utils/delegate';

export interface IExecutePayment {
  chainId: number;
  userAddress: string;
  userId: string;
  serviceId: string;
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
  const { chainId, userId, userAddress, amount, isBuyer, serviceId, signature } = body;

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

      const talentLayerClient = initializeTalentLayerClient();

      if (isBuyer) {
        transaction = await talentLayerClient.escrow.release(
          serviceId,
          BigInt(amount),
          parseInt(userId),
        )
      } else {
        transaction = await talentLayerClient.escrow.reimburse(
          serviceId,
          BigInt(amount),
          parseInt(userId),
        )
      }

      await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to execute payment';
    return Response.json({ message, error }, { status: 500 });
  }
}
