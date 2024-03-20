import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../utils/delegate';
import TalentLayerService from '../../../../contracts/ABI/TalentLayerService.json';
import { getServiceSignature } from '../../../../utils/signature';
import { checkUserEmailVerificationStatus } from '../../../utils/email';
import { getPlatformServicePostingFee } from '../../../../queries/platform';
import { getUserByTalentLayerId } from '../../../../modules/BuilderPlace/actions/user';

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

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE === 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

  // @TODO: move it to a middleware and apply to all POST and PUT ?
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

      //TODO: V2 - RPC call instead ?
      const platformFeesResponse = await getPlatformServicePostingFee(chainId, platformId);
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

      // await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to create service';
    return Response.json({ message, error }, { status: 500 });
  }
}
