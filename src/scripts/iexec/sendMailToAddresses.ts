import { IExecWeb3mail } from '@iexec/web3mail';
import { IExecDataProtector } from '@iexec/dataprotector';
import { userGaveAccessToPlatform } from '../../modules/Web3mail/utils/data-protector';
import { persistEmail } from '../../modules/Web3mail/utils/database';
import { EmailSender, EmailType } from '.prisma/client';
import { MailProviders, NotificationType } from '../../types';
import * as sgMail from '@sendgrid/mail';
import { getUserEmailsByAddresses } from '../../modules/BuilderPlace/actions/user';

export const sendMailToAddresses = async (
  emailSubject: string,
  emailContent: string,
  addresses: string[],
  platformName: string,
  providers: MailProviders,
  notificationType: NotificationType,
  emailType: EmailType,
  id?: string,
): Promise<{ successCount: number; errorCount: number }> => {
  let sentCount = 0,
    nonSentCount = 0,
    results: any[] = [],
    emailSender: EmailSender;

  console.log('Sending email to addresses');

  try {
    if (notificationType === NotificationType.WEB2 && providers?.sendGrid) {
      const sendersEmail = process.env.NEXT_PRIVATE_SENDGRID_VERIFIED_SENDER;
      if (!sendersEmail) {
        throw new Error('Senders Email is not set');
      }
      emailSender = EmailSender.SENDGRID;
      const usersEmails = await getUserEmailsByAddresses(addresses);
      if (usersEmails && usersEmails.length > 0) {
        const sendPromises = usersEmails.map(email =>
          sendMarketingEmailTo(
            // @ts-ignore
            providers.sendGrid,
            sendersEmail,
            email,
            emailSubject,
            emailContent,
          ),
        );

        results = await Promise.all(sendPromises);
      }
    } else if (notificationType === NotificationType.WEB3) {
      emailSender = EmailSender.IEXEC;
      const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('Private key is not set');
      }

      if (providers.dataProtector && providers.web3mail) {
        const sendPromises = addresses.map(address =>
          sendWeb3MarketingEmailTo(
            address,
            providers.dataProtector as IExecDataProtector,
            providers.web3mail as IExecWeb3mail,
            emailSubject,
            emailContent,
            platformName,
          ),
        );

        results = await Promise.all(sendPromises);
      }
    }

    /**
     * @dev: If no ID is provided here it means that the emails are Marketing Emails,
     * and the Database id will have the following format: <Date.getTime()-"address">
     */
    results.forEach(result => {
      if (result.success) {
        if (id) {
          persistEmail(id, emailType, emailSender);
        } else {
          const nowMilliseconds = new Date().getTime();
          const compositeId = nowMilliseconds + '-' + result.address;
          persistEmail(compositeId, emailType, emailSender);
        }
        sentCount++;
      } else {
        nonSentCount++;
      }
    });
  } catch (e: any) {
    //TODO is this try catch useful ?
    throw new Error(e.message);
  }
  return { successCount: sentCount, errorCount: nonSentCount };
};

const sendWeb3MarketingEmailTo = async (
  address: string,
  dataProtector: IExecDataProtector,
  web3mail: IExecWeb3mail,
  emailSubject: string,
  emailContent: string,
  platformName: string,
): Promise<{ address: string; success: boolean } | { success: boolean; error: any }> => {
  try {
    console.log(`------- Sending web3mail to ${address} -------`);

    // Check whether user granted access to his email
    const protectedEmailAddress = await userGaveAccessToPlatform(address, dataProtector);
    if (!protectedEmailAddress) {
      console.warn(`sendMailToAddresses - User ${address} did not grant access to his email`);
      throw new Error('access denied');
    }

    const mailSent = await web3mail.sendEmail({
      protectedData: protectedEmailAddress,
      emailSubject: emailSubject,
      emailContent: emailContent,
      contentType: 'text/html',
      senderName: platformName,
    });
    console.log('sent email', mailSent);
    return { success: true, address };
  } catch (e: any) {
    console.log(e);
    return { success: false, error: e.message };
  }
};
const sendMarketingEmailTo = async (
  sendGridProvider: typeof sgMail,
  from: string,
  email: string,
  emailSubject: string,
  emailContent: string,
): Promise<{ address: string; success: boolean } | { success: boolean; error: any }> => {
  try {
    console.log(`------- Sending mail to ${email} -------`);

    const [ClientResponse] = await sendGridProvider.send({
      from: from,
      to: email,
      subject: emailSubject,
      html: emailContent,
    });
    return { success: true, address: email };
  } catch (e: any) {
    console.log(e);
    return { success: false, error: e.message };
  }
};
