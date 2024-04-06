import { getAcceptedProposals } from '../../../queries/proposals';
import { EmailNotificationApiUri, EmailNotificationType, IProposal } from '../../../types';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { getUsersWeb3MailPreference } from '../../../queries/users';
import { calculateCronData } from '../../../modules/Web3mail/utils/cron';
import { hasEmailBeenSent, persistCronProbe } from '../../../modules/Web3mail/utils/database';
import { EmptyError, getValidUsers, prepareCronApi } from '../utils/mail';
import { renderMail } from '../utils/generateMail';
import { renderTokenAmount } from '../../../utils/conversion';
import { EmailType } from '.prisma/client';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { getVerifiedUsersEmailData } from '../../../modules/BuilderPlace/actions/user';
import { IQueryData } from '../domain/get-verified-users-email-notification-data';
import { getPlatformBy } from '../../../modules/BuilderPlace/actions/builderPlace';

export const config = {
  maxDuration: 300, // 5 minutes.
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const chainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as string;
  const databaseUrl = process.env.DATABASE_URL as string;
  const cronSecurityKey = req.headers.authorization as string;
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY as string;
  const emailNotificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3'
      ? EmailNotificationType.WEB3
      : EmailNotificationType.WEB2;
  const RETRY_FACTOR = process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    ? process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    : '0';

  let sentEmails = 0,
    nonSentEmails = 0;

  prepareCronApi(emailNotificationType, chainId, databaseUrl, cronSecurityKey, privateKey, res);

  // Check whether the user provided a timestamp or if it will come from the cron config
  const { sinceTimestamp, cronDuration } = calculateCronData(
    req,
    Number(RETRY_FACTOR),
    EmailNotificationApiUri.ProposalValidated,
  );

  let status = 200;
  try {
    const response = await getAcceptedProposals(Number(chainId), sinceTimestamp);

    if (!response?.data?.data?.proposals || response.data.data.proposals.length === 0) {
      throw new EmptyError(`No new proposals validated available`);
    }

    const proposals: IProposal[] = response.data.data.proposals;
    const nonSentProposalEmails: IProposal[] = [];

    // Check if a notification email has already been sent for these proposals
    if (proposals.length > 0) {
      for (const proposal of proposals) {
        const hasBeenSent = await hasEmailBeenSent(proposal.id, EmailType.PROPOSAL_VALIDATED);
        if (!hasBeenSent) {
          nonSentProposalEmails.push(proposal);
        }
      }
    }

    // If some emails have not been sent yet, send a web3mail & persist in the DB that the email was sent
    if (nonSentProposalEmails.length == 0) {
      throw new EmptyError(`All new proposals emails already sent`);
    }
    // Filter out users which have not opted for the feature
    const allSellerAddresses = nonSentProposalEmails.map(proposal => proposal.seller.address);

    let validUserAddresses: string[] = [];

    if (emailNotificationType === EmailNotificationType.WEB3) {
      const emailPreferencesResponse = await getUsersWeb3MailPreference(
        Number(chainId),
        allSellerAddresses,
        'activeOnProposalValidated',
      );

      if (
        !emailPreferencesResponse?.data?.data?.userDescriptions ||
        emailPreferencesResponse.data.data.userDescriptions.length === 0
      ) {
        throw new EmptyError(`No User opted for this feature`);
      }

      validUserAddresses = getValidUsers(emailPreferencesResponse.data.data.userDescriptions);
    } else {
      const result = await getVerifiedUsersEmailData();

      const filteredUsers = result?.filter(
        (data: IQueryData) => data.emailPreferences['activeOnProposalValidated'],
      );

      filteredUsers?.forEach((data: IQueryData) => {
        if (data.address) {
          validUserAddresses.push(data.address);
        }
      });
    }

    const proposalEmailsToBeSent = nonSentProposalEmails.filter(proposal =>
      validUserAddresses.includes(proposal.seller.address),
    );

    if (proposalEmailsToBeSent.length === 0) {
      throw new EmptyError(
        `New proposals validated detected, but no concerned users opted for the ${EmailType.PROPOSAL_VALIDATED} feature`,
      );
    }

    const providers = generateMailProviders(emailNotificationType, privateKey);

    for (const proposal of proposalEmailsToBeSent) {
      const builderPlaceResponse = await getPlatformBy({
        ownerTalentLayerId: proposal.service.buyer.id,
      });
      const builderPlace = builderPlaceResponse[0];

      /**
       * @dev: If the user is not a BuilderPlace owner, we skip the email sending for this iteration
       */
      const domain = builderPlace?.customDomain || builderPlace?.subdomain;

      if (!builderPlace || !domain) {
        console.warn(`User ${proposal.service.buyer.id} is not a BuilderPlace owner`);
        continue;
      }

      try {
        const email = renderMail(
          `Your proposal got accepted!`,
          `The proposal you made for the open-source mission "${
            proposal.service.description?.title
          }" you posted on BuilderPlace got accepted by ${proposal.service.buyer.handle} !
              The following amount was agreed: ${renderTokenAmount(
                proposal.rateToken,
                proposal.rateAmount,
              )}. 
              For the following work to be provided: ${proposal.description?.about}.`,
          emailNotificationType,
          builderPlace.palette as unknown as iBuilderPlacePalette,
          domain,
          proposal.seller.handle,
          `${domain}/work/${proposal.service.id}`,
          `Go to proposal detail`,
        );
        // @dev: This function needs to be throwable to avoid persisting the proposal in the DB if the email is not sent
        await sendMailToAddresses(
          `Your proposal got accepted !`,
          email,
          [proposal.seller.address],
          proposal.service.platform.name,
          providers,
          emailNotificationType,
          EmailType.PROPOSAL_VALIDATED,
          proposal.id,
        );
        console.log('Notification recorded in Database');
        sentEmails++;
      } catch (e: any) {
        nonSentEmails++;
        console.error(e.message);
      }
    }
  } catch (e: any) {
    if (e instanceof EmptyError) {
      console.warn(e.message);
    } else {
      console.error(e.message);
      status = 500;
    }
  } finally {
    if (!req.query.sinceTimestamp) {
      // Update cron probe in db
      await persistCronProbe(EmailType.PROPOSAL_VALIDATED, sentEmails, nonSentEmails, cronDuration);
      console.log(
        `Cron probe updated in DB for ${EmailType.PROPOSAL_VALIDATED}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
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
