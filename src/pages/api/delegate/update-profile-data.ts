// pages/api/createService.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../config';
import TalentLayerID from '../../../contracts/ABI/TalentLayerID.json';
import { getDelegationSigner, isPlatformAllowedToDelegate } from '../utils/delegate';
import {
  checkOrResetTransactionCounter,
  checkUserEmailVerificationStatus,
  incrementWeeklyTransactionCounter,
} from '../../../modules/BuilderPlace/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, userAddress, cid, chainId } = req.body;
  const config = getConfig(chainId);

  // @dev : you can add here all the check you need to confirm the delegation for a user

  const worker = await checkUserEmailVerificationStatus(userId, res);

  await checkOrResetTransactionCounter(worker, res);

  await isPlatformAllowedToDelegate(chainId, userAddress, res);

  try {
    const walletClient = await getDelegationSigner(res);
    if (!walletClient) {
      return;
    }

    const transaction = await walletClient.writeContract({
      address: config.contracts.talentLayerId,
      abi: TalentLayerID.abi,
      functionName: 'updateProfileData',
      args: [userId, cid],
    });

    await incrementWeeklyTransactionCounter(worker, res);

    res.status(200).json({ transaction: transaction });
  } catch (error) {
    console.error('errorDebug', error);
    res.status(500).json({ error: error });
  }
}
