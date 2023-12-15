// pages/api/createService.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from '../../../config';
import TalentLayerEscrow from '../../../contracts/ABI/TalentLayerEscrow.json';
import { getDelegationSigner, isPlatformAllowedToDelegate } from '../utils/delegate';
import {
  checkOrResetTransactionCounter,
  incrementWeeklyTransactionCounter,
} from '../../../modules/BuilderPlace/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userAddress, userId, transactionId, amount, isBuyer, chainId } = req.body;
  const config = getConfig(chainId);

  // @dev : you can add here all the check you need to confirm the delagation for a user

  const worker = await checkOrResetTransactionCounter(userId, res);

  await isPlatformAllowedToDelegate(chainId, userAddress, res);

  try {
    const walletClient = await getDelegationSigner(res);
    if (!walletClient) {
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

    await incrementWeeklyTransactionCounter(worker, res);

    res.status(200).json({ transaction: transaction });
  } catch (error) {
    console.error('errorDebug', error);
    res.status(500).json({ error: error });
  }
}
