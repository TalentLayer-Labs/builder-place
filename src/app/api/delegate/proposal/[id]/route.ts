import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../../utils/delegate';
import TalentLayerService from '../../../../../contracts/ABI/TalentLayerService.json';
import { checkUserEmailVerificationStatus } from '../../../../utils/email';
import { getUserByTalentLayerId } from '../../../../../modules/BuilderPlace/actions/user';

export interface IUpdateProposal {
  chainId: number;
  userId: string;
  userAddress: string;
  rateToken: string;
  rateAmount: string;
  expirationDate: string;
  cid: string;
  signature: `0x${string}` | Uint8Array;
}

/**
 * POST /api/delegate/proposal
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IUpdateProposal = await req.json();
  console.log('json', body);
  const { chainId, userId, userAddress, cid, rateAmount, rateToken, expirationDate, signature } =
    body;

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

      let transaction;

      console.log('Updating proposal with args', userId, cid, signature);
      transaction = await walletClient.writeContract({
        address: config.contracts.serviceRegistry,
        abi: TalentLayerService.abi,
        functionName: 'updateProposal',
        args: [userId, params.id, rateToken, rateAmount, cid, expirationDate],
      });

      // await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to update proposal';
    return Response.json({ message, error }, { status: 500 });
  }
}
