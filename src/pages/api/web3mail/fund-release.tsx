import { getNewPayments } from '../../../queries/payments';
import { IPayment, NotificationApiUri, NotificationType, PaymentTypeEnum } from '../../../types';
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
    NotificationApiUri.FundRelease,
  );

  let status = 200;
  try {
    const response = await getNewPayments(Number(chainId), platformId, sinceTimestamp);

    if (!response?.data?.data?.payments || response.data.data.payments.length === 0) {
      throw new EmptyError('No new payments available');
    }

    const payments: IPayment[] = response.data.data.payments;
    const nonSentPaymentEmails: IPayment[] = [];

    // Check if a notification email has already been sent for these fund releases
    for (const payment of payments) {
      const hasBeenSent = await hasEmailBeenSent(payment.id, EmailType.FUND_RELEASE);
      if (!hasBeenSent) {
        nonSentPaymentEmails.push(payment);
      }
    }

    // If some emails have not been sent yet, send a web3mail & persist in the DB that the email was sent
    if (nonSentPaymentEmails.length == 0) {
      throw new EmptyError('All new fund release notifications already sent');
    }

    // Check whether the users opted for the called feature | Seller if fund release, Buyer if fund reimbursement
    const allAddresses = nonSentPaymentEmails.map(payment => {
      if (payment.paymentType === PaymentTypeEnum.Release) {
        return payment.service.seller.address;
      } else {
        return payment.service.buyer.address;
      }
    });

    let validUserAddresses: string[] = [];

    if (notificationType === NotificationType.WEB3) {
      const notificationResponse = await getUsersWeb3MailPreference(
        Number(chainId),
        allAddresses,
        'activeOnFundRelease',
      );

      if (
        !notificationResponse?.data?.data?.userDescriptions ||
        notificationResponse.data.data.userDescriptions.length === 0
      ) {
        throw new EmptyError('No User opted for this feature');
      }
      validUserAddresses = getValidUsers(notificationResponse.data.data.userDescriptions);
    } else {
      const result = await getVerifiedUsersNotificationData();

      const filteredUsers = result.filter(
        (data: IQueryData) => data.emailPreferences['activeOnFundRelease'],
      );

      filteredUsers.forEach((data: IQueryData) => {
        if (data.address) {
          validUserAddresses.push(data.address);
        }
      });
    }

    const paymentEmailsToBeSent = nonSentPaymentEmails.filter(payment =>
      validUserAddresses.includes(
        payment.paymentType === PaymentTypeEnum.Release
          ? payment.service.seller.address
          : payment.service.buyer.address,
      ),
    );

    if (paymentEmailsToBeSent.length === 0) {
      throw new EmptyError(
        `New fund release detected, but no concerned users opted for the ${EmailType.FUND_RELEASE} feature`,
      );
    }

    const providers = generateMailProviders(notificationType as NotificationType, privateKey);

    for (const payment of paymentEmailsToBeSent) {
      let senderHandle = '',
        receiverHandle = '',
        action = '',
        receiverAddress = '';
      if (payment.paymentType === PaymentTypeEnum.Release) {
        senderHandle = payment.service.buyer.handle;
        receiverHandle = payment.service.seller.handle;
        action = 'released';
        receiverAddress = payment.service.seller.address;
      } else {
        senderHandle = payment.service.seller.handle;
        receiverHandle = payment.service.buyer.handle;
        action = 'reimbursed';
        receiverAddress = payment.service.buyer.address;
      }

      console.log(
        `New fund ${action} email to send to ${senderHandle} at address ${receiverAddress}`,
      );

      const builderPlace = await getBuilderPlaceByOwnerId(payment.service.buyer.id);

      /**
       * @dev: If the user is not a BuilderPlace owner, we skip the email sending for this iteration
       */
      const domain = builderPlace?.customDomain || builderPlace?.subdomain;

      if (!builderPlace || !domain) {
        console.warn(`User ${payment.service.buyer.id} is not a BuilderPlace owner`);
        continue;
      }

      const email = renderMail(
        `Funds released!`,
        `${senderHandle} has ${action} ${renderTokenAmount(
          payment.rateToken,
          payment.amount,
        )} for the project ${payment.service.description?.title} on BuilderPlace !`,
        notificationType,
        builderPlace.palette as unknown as iBuilderPlacePalette,
        domain,
        builderPlace.logo,
        receiverHandle,
        `${domain}/work/${payment.service.id}`,
        `Go to payment detail`,
      );

      try {
        const { successCount, errorCount } = await sendMailToAddresses(
          `Funds ${action} for the open-source work project - ${payment.service.description?.title}`,
          email,
          [receiverAddress],
          payment.service.platform.name,
          providers,
          notificationType,
          EmailType.FUND_RELEASE,
          payment.id,
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
      console.error(e.message);
      status = 500;
    }
  } finally {
    if (!req.query.sinceTimestamp) {
      // Update cron probe in db
      await persistCronProbe(EmailType.FUND_RELEASE, sentEmails, nonSentEmails, cronDuration);
      console.log(
        `Cron probe updated in DB for ${EmailType.FUND_RELEASE}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
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
