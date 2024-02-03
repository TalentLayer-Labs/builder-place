import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { prepareNonCronApi } from '../utils/mail';
import { recoverMessageAddress } from 'viem';
import { renderMail } from '../utils/generateMail';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { NotificationType } from '../../../types';
import { EmailType } from '.prisma/client';
import { getBuilderPlaceByCollaboratorAddressAndId } from '../../../modules/BuilderPlace/actions/builderPlace';

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

  const { emailSubject, emailContent, signature, usersAddresses, builderPlaceId } = req.body;
  if (!emailSubject || !emailContent || !signature || !usersAddresses || !builderPlaceId)
    return res.status(500).json(`Missing argument`);

  if (emailSubject.length >= 78)
    return res.status(400).json(`Email subject must be less than 78 characters`);

  try {
    // Check whether the address which provided the signature is the owner of the platform
    const address = await recoverMessageAddress({
      message: builderPlaceId.toString(),
      signature,
    });

    const builderPlace = await getBuilderPlaceByCollaboratorAddressAndId(address, builderPlaceId);
    const domain = builderPlace?.customDomain || builderPlace?.subdomain;

    if (!builderPlace || !domain) {
      return res.status(401).json(`Unauthorized`);
    }

    const email = renderMail(
      emailSubject,
      emailContent,
      notificationType,
      builderPlace.palette,
      domain,
      builderPlace.logo,
    );

    const providers = generateMailProviders(notificationType as NotificationType, privateKey);

    const { successCount, errorCount } = await sendMailToAddresses(
      `${emailSubject}`,
      `${email}`,
      usersAddresses,
      builderPlace.name,
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
