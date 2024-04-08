import { EmailNotificationApiUri, EmailNotificationType, IReview } from '../../../types';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { getUsersWeb3MailPreference } from '../../../queries/users';
import { calculateCronData } from '../../../modules/Web3mail/utils/cron';
import { hasEmailBeenSent, persistCronProbe } from '../../../modules/Web3mail/utils/database';
import { getNewReviews } from '../../../queries/reviews';
import { EmptyError, getValidUsers, prepareCronApi } from '../utils/mail';
import { renderMail } from '../utils/generateMail';
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
  const notificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3'
      ? EmailNotificationType.WEB3
      : EmailNotificationType.WEB2;
  const RETRY_FACTOR = process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    ? process.env.NEXT_WEB3MAIL_RETRY_FACTOR
    : '0';

  let sentEmails = 0,
    nonSentEmails = 0;

  prepareCronApi(notificationType, chainId, databaseUrl, cronSecurityKey, privateKey, res);

  // Check whether the user provided a timestamp or if it will come from the cron config
  const { sinceTimestamp, cronDuration } = calculateCronData(
    req,
    Number(RETRY_FACTOR),
    EmailNotificationApiUri.Review,
  );

  let status = 200;
  try {
    const response = await getNewReviews(Number(chainId), sinceTimestamp);

    if (!response?.data?.data?.reviews || response.data.data.reviews.length === 0) {
      throw new EmptyError(`No new reviews available`);
    }

    // Check if a notification email has already been sent for these reviews
    const reviews: IReview[] = response.data.data.reviews;
    const nonSentReviewEmails: IReview[] = [];

    if (reviews.length > 0) {
      for (const review of reviews) {
        const hasBeenSent = await hasEmailBeenSent(review.id, EmailType.REVIEW);
        if (!hasBeenSent) {
          nonSentReviewEmails.push(review);
        }
      }
    }

    // If some emails have not been sent yet, send a web3mail & persist in the DB that the email was sent
    if (nonSentReviewEmails.length == 0) {
      throw new EmptyError(`All review notifications already sent`);
    }
    // Filter out users which have not opted for the feature
    const allRevieweesAddresses = nonSentReviewEmails.map(review => review.to.address);

    let validUserAddresses: string[] = [];

    if (notificationType === EmailNotificationType.WEB3) {
      const notificationResponse = await getUsersWeb3MailPreference(
        Number(chainId),
        allRevieweesAddresses,
        'activeOnReview',
      );

      if (
        !notificationResponse?.data?.data?.userDescriptions ||
        notificationResponse.data.data.userDescriptions.length === 0
      ) {
        throw new EmptyError(`No User opted for this feature`);
      }

      validUserAddresses = getValidUsers(notificationResponse.data.data.userDescriptions);
    } else {
      const result = await getVerifiedUsersEmailData();

      const filteredUsers = result?.filter(
        (data: IQueryData) => data.emailPreferences['activeOnReview'],
      );

      filteredUsers?.forEach((data: IQueryData) => {
        if (data.address) {
          validUserAddresses.push(data.address);
        }
      });
    }

    const reviewEmailsToBeSent = nonSentReviewEmails.filter(review =>
      validUserAddresses.includes(review.to.address),
    );

    if (reviewEmailsToBeSent.length === 0) {
      throw new EmptyError(
        `New reviews detected, but no concerned users opted for the ${EmailType.REVIEW} feature`,
      );
    }

    const providers = generateMailProviders(notificationType, privateKey);

    for (const review of reviewEmailsToBeSent) {
      let fromHandle = '',
        fromAddress = '';
      if (review.to.address === review.service.buyer.address) {
        fromHandle = review.service.seller.handle;
        fromAddress = review.service.seller.address;
      } else {
        fromHandle = review.service.buyer.handle;
        fromAddress = review.service.buyer.address;
      }
      console.log(
        `A review with id ${review.id} was created from ${fromHandle} owning the address ${fromAddress} for the open-source contribution ${review.service.id}!`,
      );
      review.to.address === review.service.buyer.address
        ? console.log('Reviewer is the seller')
        : console.log('Reviewer is the buyer');

      const builderPlace = await getPlatformBy({
        ownerTalentLayerId: review.service.buyer.id,
      });

      /**
       * @dev: If the user is not a BuilderPlace owner, we skip the email sending for this iteration
       */
      const domain = builderPlace?.customDomain || builderPlace?.subdomain;

      if (!builderPlace || !domain) {
        console.warn(`User ${review.service.buyer.id} is not a BuilderPlace owner`);
        continue;
      }

      try {
        const email = renderMail(
          `You received a new review!`,
          `${fromHandle} has left a review for the open-source contribution ${review.service.description?.title}.
            The open-source contribution was rated ${review.rating}/5 stars and the following comment was left: ${review.description?.content}.
            Congratulations on completing your open-source contribution and improving your reputation !`,
          notificationType,
          builderPlace.palette as unknown as iBuilderPlacePalette,
          domain,
          builderPlace.logo,
          review.to.handle,
          `${domain}/work/${review.service.id}`,
          `Go to review detail`,
        );

        await sendMailToAddresses(
          `A review was created for the open-source contribution - ${review.service.description?.title}`,
          email,
          [review.to.address],
          review.service.platform.name,
          providers,
          notificationType,
          EmailType.REVIEW,
          review.id,
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
      persistCronProbe(EmailType.REVIEW, sentEmails, nonSentEmails, cronDuration);
      console.log(
        `Cron probe updated in DB for ${EmailType.REVIEW}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
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
