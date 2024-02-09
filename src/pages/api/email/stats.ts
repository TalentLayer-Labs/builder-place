import { NextApiRequest, NextApiResponse } from 'next';
import {
  getCronProbeCount,
  getEmailCount,
  getEmailCountByMonth,
} from '../../../modules/Web3mail/utils/database';
import { EmailStats, EmailNotificationType } from '../../../types';
import { Contact } from '@iexec/web3mail';
import { getVerifiedEmailCount } from '../../../modules/BuilderPlace/actions/user';
import { generateMailProviders } from '../utils/mailProvidersSingleton';

export const config = {
  maxDuration: 300, // 5 minutes.
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as string;
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY as string;
  const isWeb3mailActive = (process.env.NEXT_PUBLIC_EMAIL_MODE as string) === 'web3';

  if (isWeb3mailActive && !chainId) {
    return res.status(500).json('Chain Id is not set');
  }

  if (isWeb3mailActive && !privateKey) {
    return res.status(500).json('Private key is not set');
  }

  const databaseUrl = process.env.DATABASE_URL as string;

  if (!databaseUrl) {
    return res.status(500).json('database Url is not set');
  }

  const stats: EmailStats = {
    totalSent: 0,
    totalSentByMonth: [],
    totalSentThisMonth: 0,
    totalContact: 0,
    totalCronRunning: 0,
  };

  try {
    stats.totalSent = await getEmailCount();
    stats.totalCronRunning = await getCronProbeCount();
    stats.totalSentByMonth = await getEmailCountByMonth();
    stats.totalSentThisMonth = stats.totalSentByMonth[new Date().getMonth()] || 0;

    const { web3mail } = generateMailProviders(EmailNotificationType.WEB3, privateKey);

    if (isWeb3mailActive && web3mail) {
      const contactList: Contact[] = await web3mail.fetchMyContacts();
      stats.totalContact = contactList.length;
    } else {
      stats.totalContact = (await getVerifiedEmailCount()) || 0;
    }

    return res.status(200).json({ message: `Successfully fetched email stats`, data: stats });
  } catch (e: any) {
    console.error(e.message);
    return res.status(500).json(`Error while fetching email stats - ${e.message}`);
  }
}
