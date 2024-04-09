import {
  EmailNotificationApiUri,
  EmailNotificationType,
  IService,
  IUserDetails,
} from '../../../types';
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
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { getVerifiedUsersEmailData } from '../../../modules/BuilderPlace/actions/user';
import { IQueryData } from '../domain/get-verified-users-email-notification-data';
import { getPlatformsBy } from '../../../modules/BuilderPlace/actions/builderPlace';

export const config = {
  maxDuration: 300, // 5 minutes.
};

interface IUserForService {
  id: string;
  address: string;
  name: string;
  skills: string[];
}

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

  const providers = generateMailProviders(
    emailNotificationType as EmailNotificationType,
    privateKey,
  );

  // Check whether the user provided a timestamp or if it will come from the cron config
  const { sinceTimestamp, cronDuration } = calculateCronData(
    req,
    Number(RETRY_FACTOR),
    EmailNotificationApiUri.NewService,
  );
  let status = 200;
  try {
    /**
     * @notice: Get all users that opted for the feature
     * @dev: Depending on the notification type, different methods are used to fetch the users
     * and get different data. So for this cron job, data will be formatted using the custom
     * IUserForService interface.
     */
    let validUsers: IUserForService[] = [];

    if (emailNotificationType === EmailNotificationType.WEB3 && providers.web3mail) {
      // Fetch all contacts who protected their email and granted access to the platform
      const allContacts = await providers.web3mail.fetchMyContacts();

      if (!allContacts || allContacts.length === 0) {
        throw new EmptyError(`No contacts granted access to their email`);
      }

      const allContactsAddresses = allContacts.map(contact => contact.owner);

      const response = await getWeb3mailUsersForNewServices(
        Number(chainId),
        allContactsAddresses,
        'activeOnNewService',
      );

      if (
        response?.data?.data?.userDescriptions &&
        response.data.data.userDescriptions.length > 0
      ) {
        // Only select the latest version of each user metaData
        const validUserDescriptions = response.data.data.userDescriptions.filter(
          (userDetails: IUserDetails) => userDetails.user?.description?.id === userDetails.id,
        );
        // For each unique user, format it and push it to "validUsers" array
        validUserDescriptions.forEach((userDetails: IUserDetails) => {
          const user = validUsers.find(user => user.id === userDetails.id);
          if (!user) {
            validUsers.push({
              id: userDetails.id,
              address: userDetails.user.address,
              name: userDetails.name,
              skills: userDetails.skills_raw?.split(',') || [],
            });
          }
        });
      } else {
        throw new EmptyError(`No User opted for this feature`);
      }
    } else {
      const result = await getVerifiedUsersEmailData(true);

      const filteredUsers = result?.filter(
        (data: IQueryData) => data.emailPreferences['activeOnNewService'],
      );

      filteredUsers?.forEach((data: IQueryData) => {
        if (data.address) {
          validUsers.push({
            id: data.id.toString(),
            address: data.address,
            name: data.name,
            skills: data.workerProfile?.skills || [],
          });
        }
        console.log('validUsers', validUsers);
      });
    }

    // Check if new services are available & get their keywords
    const serviceResponse = await getNewServicesForPlatform(Number(chainId), sinceTimestamp);

    if (!serviceResponse?.data?.data?.services) {
      throw new EmptyError(`No new services available`);
    }

    const services: IService[] = serviceResponse.data.data.services;

    console.log('Fetched Services:', services);

    // For each contact, check if an email was already sent for each new service. If not, check if skills match
    for (const user of validUsers) {
      console.log(
        '************************************* User *************************************',
        user.address,
      );
      for (const service of services) {
        console.log('service', service.description?.title);
        // Check if a notification email has already been sent for these services
        const compositeId = `${user.id}-${service.id}`;
        const emailHasBeenSent = await hasEmailBeenSent(compositeId, EmailType.NEW_SERVICE);
        if (!emailHasBeenSent) {
          const userSkills = user.skills;
          const serviceSkills = service.description?.keywords_raw?.split(',');
          console.log('userSkills', userSkills);
          console.log('serviceSkills', serviceSkills);
          // Check if the service keywords match the user keywords
          const matchingSkills = userSkills?.filter((skill: string) =>
            serviceSkills?.includes(skill),
          );

          if (matchingSkills && matchingSkills?.length > 0) {
            console.log(
              `The skills ${
                user.name
              } has which are required by this mission are: ${matchingSkills.join(', ')}`,
            );

            const builderPlaceResponse = await getPlatformsBy({
              ownerTalentLayerId: service.buyer.id,
            });

            const builderPlace = builderPlaceResponse[0];

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
                `Good news, the following mission: "${
                  service.description?.title
                }" was recently posted by ${service.buyer.handle} and you are a good match for it. 
                  
                  <br/><br/>
                  
                  The skills you have which are required by this mission are: ${matchingSkills
                    .map(skill => `<b>${skill}</b>`)
                    .join(', ')}.
                  
                  Be the first one to send a proposal !`,
                emailNotificationType,
                builderPlace.palette as unknown as iBuilderPlacePalette,
                domain,
                builderPlace.logo,
                user.name,
                `${domain}/work/${service.id}`,
                `Go to open-source mission details`,
              );
              const { successCount, errorCount } = await sendMailToAddresses(
                `A new open-source mission matching your skills is available on BuilderPlace !`,
                email,
                [user.address],
                service.platform.name,
                providers,
                emailNotificationType,
                EmailType.NEW_SERVICE,
                compositeId,
              );
              sentEmails += successCount;
              nonSentEmails += errorCount;
              console.log('Notification recorded in Database');
            } catch (e: any) {
              console.error(e.message);
              nonSentEmails++;
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
      try {
        // Update cron probe in db
        await persistCronProbe(EmailType.NEW_SERVICE, sentEmails, nonSentEmails, cronDuration);
        console.log(
          `Cron probe updated in DB for ${EmailType.NEW_SERVICE}: duration: ${cronDuration}, sentEmails: ${sentEmails}, nonSentEmails: ${nonSentEmails}`,
        );
      } catch (e: any) {
        console.error('Error while updating cron probe in DB', e.message);
      }
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
