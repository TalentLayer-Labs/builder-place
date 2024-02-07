import { NextApiRequest, NextApiResponse } from 'next';
import { Contact } from '@iexec/web3mail';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { NotificationType } from '../../../types';

export const config = {
  maxDuration: 300, // 5 minutes.
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as string;
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY as string;
  const isWeb3mailActive = (process.env.NEXT_PUBLIC_EMAIL_MODE as string) === 'web3';

  if (!isWeb3mailActive) {
    return res.status(500).json({ message: 'Web3mail not activated' });
  }

  if (!chainId) {
    return res.status(500).json('Chain Id is not set');
  }

  if (!privateKey) {
    return res.status(500).json('Private key is not set');
  }

  try {
    const { web3mail } = generateMailProviders(NotificationType.WEB3, privateKey);
    if (web3mail) {
      const contactList: Contact[] = await web3mail.fetchMyContacts();
      return res
        .status(200)
        .json({
          message: `Successfully fetched ${contactList.length} contacts`,
          data: contactList,
        });
    }
  } catch (e: any) {
    console.error(e.message);
    return res.status(500).json(`Error while fetching contacts - ${e.message}`);
  }
}
