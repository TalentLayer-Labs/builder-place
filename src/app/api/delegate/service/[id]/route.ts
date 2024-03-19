import { getConfig } from '../../../../../config';
import { getUserByTalentLayerId } from '../../../../../modules/BuilderPlace/actions/user';
import { checkUserEmailVerificationStatus } from '../../../../utils/email';
import TalentLayerService from '../../../../../contracts/ABI/TalentLayerService.json';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../../utils/delegate';
import { recoverMessageAddress } from 'viem';

export interface IUpdateService {
  chainId: number;
  userId: string;
  userAddress: string;
  cid: string;
  signature: `0x${string}` | Uint8Array;
}

/**
 * PUT /api/delegate/service
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IUpdateService = await req.json();
  console.log('json', body);
  const { chainId, userId, userAddress, cid, signature } = body;

  const config = getConfig(chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    throw new Error('Delegation is not activated');
    // return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
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

      console.log(`Updating service ${params.id} with args`, userId, cid);

      transaction = await walletClient.writeContract({
        address: config.contracts.serviceRegistry,
        abi: TalentLayerService.abi,
        functionName: 'updateServiceData',
        args: [userId, params.id, cid],
      });

      // await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to create service';
    return Response.json({ message, error }, { status: 500 });
  }
}
