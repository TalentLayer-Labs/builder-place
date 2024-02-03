import { IService, IUserDetails, NotificationApiUri, NotificationType } from '../../../types';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendMailToAddresses } from '../../../scripts/iexec/sendMailToAddresses';
import { getWeb3mailUsersForNewServices } from '../../../queries/users';
import { calculateCronData } from '../../../modules/Web3mail/utils/cron';
import { hasEmailBeenSent, persistCronProbe } from '../../../modules/Web3mail/utils/database';
import { getNewServicesForPlatform } from '../../../queries/services';
import { EmptyError, prepareCronApi } from '../utils/mail';
import { renderMail } from '../utils/generateMail';
import { EmailType } from '.prisma/client';
import { generateMailProviders } from '../utils/mailProvidersSingleton';
import { getBuilderPlaceByOwnerId } from '../../../modules/BuilderPlace/actions/builderPlace';

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

  const providers = generateMailProviders(notificationType as NotificationType, privateKey);

  // Check whether the user provided a timestamp or if it will come from the cron config
  const { sinceTimestamp, cronDuration } = calculateCronData(
    req,
    Number(RETRY_FACTOR),
    NotificationApiUri.NewService,
  );

  let status = 200;
  try {
    if (providers.web3mail) {
      // Fetch all contacts who protected their email and granted access to the platform
      const allContacts = await providers.web3mail.fetchMyContacts();

      if (!allContacts || allContacts.length === 0) {
        throw new EmptyError(`No contacts granted access to their email`);
      }

      const allContactsAddresses = allContacts.map(contact => contact.owner);

      // Get all users that opted for the feature
      const response = await getWeb3mailUsersForNewServices(
        Number(chainId),
        allContactsAddresses,
        'activeOnNewService',
      );

      let validUsers: IUserDetails[] = [];

      if (
        response?.data?.data?.userDescriptions &&
        response.data.data.userDescriptions.length > 0
      ) {
        validUsers = response.data.data.userDescriptions;
        // Only select the latest version of each user metaData
        validUsers = validUsers.filter(contact => contact.user?.description?.id === contact.id);
      } else {
        throw new EmptyError(`No User opted for this feature`);
      }

      // Check if new services are available & get their keywords
      const serviceResponse = await getNewServicesForPlatform(
        Number(chainId),
        platformId,
        sinceTimestamp,
      );

      if (!serviceResponse?.data?.data?.services) {
        throw new EmptyError(`No new services available`);
      }

      const services: IService[] = serviceResponse.data.data.services;

      // For each contact, check if an email was already sent for each new service. If not, check if skills match
      for (const contact of validUsers) {
        console.log(
          '*************************************Contact*************************************',
          contact.user.address,
        );
        for (const service of services) {
          // Check if a notification email has already been sent for these services
          const emailHasBeenSent = await hasEmailBeenSent(
            `${contact.user.id}-${service.id}`,
            EmailType.NEW_SERVICE,
          );
          if (!emailHasBeenSent) {
            const userSkills = contact.skills_raw?.split(',');
            const serviceSkills = service.description?.keywords_raw?.split(',');
            // Check if the service keywords match the user keywords
            const matchingSkills = userSkills?.filter((skill: string) =>
              serviceSkills?.includes(skill),
            );

            if (matchingSkills && matchingSkills?.length > 0) {
              console.log(
                `The skills ${
                  contact.user.handle
                } has which are required by this open-source contribution mission are: ${matchingSkills.join(
                  ', ',
                )}`,
              );

              const builderPlace = await getBuilderPlaceByOwnerId(service.buyer.id);

              /**
               * @dev: If the user is not a BuilderPlace owner, we skip the email sending for this iteration
               */
              const domain = builderPlace?.customDomain || builderPlace?.subdomain;

              if (!builderPlace || !domain) {
                console.warn(`User ${service.buyer.id} is not a BuilderPlace owner`);
                continue;
              }

              try {
                const email = renderMail(
                  `New mission available on BuilderPlace!`,
                  `Good news, the following open-source contribution mission: "${
                    service.description?.title
                  }" was recently posted by ${service.buyer.handle} and you are a good match for it.
                  Here is what is proposed: ${service.description?.about}.
                  
                  The skills you have which are required by this open-source contribution mission are: ${matchingSkills.join(
                    ', ',
                  )}.
                  
                  Be the first one to send a proposal !`,
                  notificationType,
                  builderPlace.palette,
                  domain,
                  builderPlace.logo,
                  contact.user.handle,
                  `${domain}/work/${service.id}`,
                  `Go to open-source mission details`,
                );
                const { successCount, errorCount } = await sendMailToAddresses(
                  `A new open-source mission matching your skills is available on BuilderPlace !`,
                  email,
                  [contact.user.address],
                  service.platform.name,
                  providers,
                  notificationType as NotificationType,
                  EmailType.NEW_SERVICE,
                  service.id,
                );
                sentEmails += successCount;
                nonSentEmails += errorCount;
                console.log('Notification recorded in Database');
                sentEmails++;
              } catch (e: any) {
                console.error(e.message);
                nonSentEmails++;
              }
            }
          }
        }
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
      await persistCronProbe(EmailType.NEW_SERVICE, sentEmails, nonSentEmails, cronDuration);
      console.log(
        `Cron probe updated in DB for ${EmailType.NEW_SERVICE}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
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
