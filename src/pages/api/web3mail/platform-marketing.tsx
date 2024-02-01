import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { prepareNonCronApi } from '../utils/mail';
import { recoverMessageAddress } from 'viem';
import { getPlatformId } from '../../../queries/platform';
import { renderMail } from '../utils/generateWeb3Mail';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { NotificationType } from '../../../types';
import { EmailType } from '.prisma/client';

export const config = {
  maxDuration: 300, // 5 minutes.
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  const platformId = process.env.NEXT_PUBLIC_PLATFORM_ID;
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY as string;
  const notificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3' ? NotificationType.WEB3 : NotificationType.WEB2;

  let sentEmails = 0,
    nonSentEmails = 0;

  prepareNonCronApi(notificationType, chainId, platformId, privateKey, res);

  const { emailSubject, emailContent, signature, usersAddresses } = req.body;
  if (!emailSubject || !emailContent || !signature || !usersAddresses)
    return res.status(500).json(`Missing argument`);

  if (emailSubject.length >= 78)
    return res.status(400).json(`Email subject must be less than 78 characters`);

  try {
    // Check whether the address which provided the signature is the owner of the platform
    const address = await recoverMessageAddress({
      message: emailSubject,
      signature,
    });

    const platformResponse = await getPlatformId(Number(chainId), address);
    const platformId: string | undefined = platformResponse.data?.data?.platforms[0]?.id;

    if (!platformId || (platformId && platformId !== process.env.NEXT_PUBLIC_PLATFORM_ID)) {
      return res.status(401).json(`Unauthorized`);
    }

    const email = renderMail(emailSubject, emailContent);

    const providers = generateMailProviders(notificationType as NotificationType, privateKey);

    const { successCount, errorCount } = await sendMailToAddresses(
      `${emailSubject}`,
      `${email}`,
      usersAddresses,
      platformResponse.data.data.platforms[0].name,
      providers,
      notificationType as NotificationType,
      EmailType.PLATFORM_MARKETING,
    );
    sentEmails += successCount;
    nonSentEmails += errorCount;
  } catch (e: any) {
    console.error(e);
    return res.status(500).json(`Error while sending email - ${e.message}`);
  } finally {
    console.log(
      `Web3 Emails sent - ${sentEmails} email successfully sent | ${nonSentEmails} non sent emails`,
    );
  }
  return res
    .status(200)
    .json(
      `Web3 Emails sent - ${sentEmails} email successfully sent | ${nonSentEmails} non sent emails`,
    );
}
