import { getProposalsFromPlatformServices } from '../../../queries/proposals';
import { IProposal, NotificationApiUri, NotificationType } from '../../../types';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { getUsersWeb3MailPreference } from '../../../queries/users';
import { calculateCronData } from '../../../modules/Web3mail/utils/cron';
import { hasEmailBeenSent, persistCronProbe } from '../../../modules/Web3mail/utils/database';
import { EmptyError, getValidUsers, prepareCronApi } from '../utils/mail';
import { renderTokenAmount } from '../../../utils/conversion';
import { renderMail } from '../utils/generateMail';
import { EmailType } from '.prisma/client';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { getBuilderPlaceByOwnerId } from '../../../modules/BuilderPlace/actions/builderPlace';
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { getVerifiedUsersNotificationData } from '../../../modules/BuilderPlace/actions/user';
import { IQueryData } from '../domain/get-verified-users-notification-data';

export const config = {
  maxDuration: 300, // 5 minutes.
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as string;
  const platformId = process.env.NEXT_PUBLIC_PLATFORM_ID as string;
  const databaseUrl = process.env.DATABASE_URL as string;
  const cronSecurityKey = req.headers.authorization as string;
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY as string;
  const notificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3' ? NotificationType.WEB3 : NotificationType.WEB2;
  const RETRY_FACTOR = process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    ? process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    : '0';

  let sentEmails = 0,
    nonSentEmails = 0;

  prepareCronApi(
    notificationType,
    chainId,
    platformId,
    databaseUrl,
    cronSecurityKey,
    privateKey,
    res,
  );

  // Check whether the user provided a timestamp or if it will come from the cron config
  const { sinceTimestamp, cronDuration } = calculateCronData(
    req,
    Number(RETRY_FACTOR),
    NotificationApiUri.NewProposal,
  );

  let status = 200;
  try {
    const response = await getProposalsFromPlatformServices(
      Number(chainId),
      platformId,
      sinceTimestamp,
    );

    if (!response?.data?.data?.proposals || response.data.data.proposals.length === 0) {
      throw new EmptyError(`No new proposals available`);
    }

    const proposals: IProposal[] = response.data.data.proposals;
    const nonSentProposalEmails: IProposal[] = [];

    // Check if a notification email has already been sent for these proposals
    if (proposals.length > 0) {
      for (const proposal of proposals) {
        const hasBeenSent = await hasEmailBeenSent(proposal.id, EmailType.NEW_PROPOSAL);
        if (!hasBeenSent) {
          nonSentProposalEmails.push(proposal);
        }
      }
    }

    // If some emails have not been sent yet, send a web3mail & persist in the DB that the email was sent
    if (nonSentProposalEmails.length == 0) {
      throw new EmptyError(`All new proposals notifications already sent`);
    }

    // Filter out users which have not opted for the feature
    const allBuyerAddresses = nonSentProposalEmails.map(proposal => proposal.service.buyer.address);

    let validUserAddresses: string[] = [];

    if (notificationType === NotificationType.WEB3) {
      const notificationResponse = await getUsersWeb3MailPreference(
        Number(chainId),
        allBuyerAddresses,
        'activeOnNewProposal',
      );

      if (
        !notificationResponse?.data?.data?.userDescriptions ||
        notificationResponse.data.data.userDescriptions.length === 0
      ) {
        throw new EmptyError(`No User opted for this feature`);
      }

      validUserAddresses = getValidUsers(notificationResponse.data.data.userDescriptions);
    } else {
      const result = await getVerifiedUsersNotificationData();

      const filteredUsers = result?.filter(
        (data: IQueryData) => data.emailPreferences['activeOnNewProposal'],
      );

      filteredUsers?.forEach((data: IQueryData) => {
        if (data.address) {
          validUserAddresses.push(data.address);
        }
      });
    }

    const proposalEmailsToBeSent = nonSentProposalEmails.filter(proposal =>
      validUserAddresses.includes(proposal.service.buyer.address),
    );

    if (proposalEmailsToBeSent.length === 0) {
      throw new EmptyError(
        `New proposals detected, but no concerned users opted for the ${EmailType.NEW_PROPOSAL} feature`,
      );
    }

    const providers = generateMailProviders(notificationType as NotificationType, privateKey);

    for (const proposal of proposalEmailsToBeSent) {
      const builderPlace = await getBuilderPlaceByOwnerId(proposal.buyer.id);

      /**
       * @dev: If the user is not a BuilderPlace owner, we skip the email sending for this iteration
       */
      const domain = builderPlace?.customDomain || builderPlace?.subdomain;

      if (!builderPlace || !domain) {
        console.warn(`User ${proposal.buyer.id} is not a BuilderPlace owner`);
        continue;
      }

      try {
        const email = renderMail(
          `You got a new proposal!`,
          `You just received a new proposal for the open-source mission "${
            proposal.service.description?.title
          }" you posted on BuilderPlace !
          ${
            proposal.seller.handle
          } can complete your work for the following amount: ${renderTokenAmount(
            proposal.rateToken,
            proposal.rateAmount,
          )}.`,
          notificationType,
          builderPlace.palette as unknown as iBuilderPlacePalette,
          domain,
          builderPlace.logo,
          proposal.service.buyer.handle,
          `${builderPlace.customDomain || builderPlace.subdomain}/work/${proposal.service.id}`,
          `Go to proposal detail`,
        );

        const { successCount, errorCount } = await sendMailToAddresses(
          `You got a new proposal !`,
          email,
          [proposal.service.buyer.address],
          proposal.service.platform.name,
          providers,
          notificationType,
          EmailType.NEW_PROPOSAL,
          proposal.id,
        );
        console.log('Notification recorded in Database');
        sentEmails += successCount;
        nonSentEmails += errorCount;
      } catch (e: any) {
        nonSentEmails++;
        console.error(e.message);
      }
    }
  } catch (e: any) {
    if (e instanceof EmptyError) {
      console.warn(e.message);
    } else {
      console.error(e);
      console.error(e.message);
      status = 500;
    }
  } finally {
    if (!req.query.sinceTimestamp) {
      // Update cron probe in db
      await persistCronProbe(EmailType.NEW_PROPOSAL, sentEmails, nonSentEmails, cronDuration);
      console.log(
        `Cron probe updated in DB for ${EmailType.NEW_PROPOSAL}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
      );
    }
    console.log(
      `Web3 Emails sent - ${sentEmails} email successfully sent | ${nonSentEmails} non sent emails`,
    );
  }
  return res
    .status(status)
    .json(
      `Web3 Emails sent - ${sentEmails} email successfully sent | ${nonSentEmails} non sent emails`,
    );
}
