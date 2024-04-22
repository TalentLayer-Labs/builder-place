import { recoverMessageAddress } from 'viem';
import { getConfig } from '../../../../../config';
import {
  getDelegationSigner,
  getPublicClient,
  isPlatformAllowedToDelegate,
} from '../../../../utils/delegate';
import {
  getUserByAddress,
  getUserByTalentLayerId,
} from '../../../../../modules/BuilderPlace/actions/user';
import { ERROR_EMAIL_NOT_VERIFIED } from '../../../../../modules/BuilderPlace/apiResponses';
import {
  checkOrResetTransactionCounter,
  incrementWeeklyTransactionCounter,
} from '../../../../utils/email';
import { initializeTalentLayerClient } from '../../../../../utils/delegate';

export interface IUpdateTalentLayerProfile {
  chainId: number;
  userAddress: string;
  profile: any;
  signature: `0x${string}` | Uint8Array;
}

/**
 * PUT /api/delegate/user
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IUpdateTalentLayerProfile = await req.json();
  console.log('json', body);
  const { chainId, userAddress, profile, signature } = body;

  const config = getConfig(chainId);

  if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE !== 'true') {
    return Response.json({ message: 'Delegation is not activated' }, { status: 500 });
  }

  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${userAddress}`,
    signature: signature,
  });

  const user = await getUserByAddress(signatureAddress);

  if (user?.talentLayerId !== params.id) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const user = await getUserByTalentLayerId(params.id);

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

      const publicClient = getPublicClient();
      if (!publicClient) {
        console.log('Public client not found');
        return Response.json({ error: 'Server Error' }, { status: 500 });
      }

      let transaction;

      const talentLayerClient = initializeTalentLayerClient();
      if (!talentLayerClient) {
        console.log('TalentLayer client not found');
        return Response.json({ error: 'Server Error' }, { status: 500 });
      }

      console.log('Updating profile with args', params.id, profile, signature);
      transaction = await talentLayerClient.profile.update(
        profile,
        params.id,
      )

      await incrementWeeklyTransactionCounter(user);

      return Response.json({ transaction: transaction }, { status: 201 });
    }
  } catch (error: any) {
    let message = 'Failed to update proposal';
    return Response.json({ message, error }, { status: 500 });
  }
}
