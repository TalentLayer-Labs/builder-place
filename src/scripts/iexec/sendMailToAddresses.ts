import { IExecWeb3mail } from '@iexec/web3mail';
import { IExecDataProtector } from '@iexec/dataprotector';
import { userGaveAccessToPlatform } from '../../modules/Web3mail/utils/data-protector';
import { persistEmail } from '../../modules/Web3mail/utils/database';
import { EmailType } from '.prisma/client';

/**
 * @dev: The parameter "throwable" will interrupt the function's loop and throw an error if set to true
 * and simply log the error & keep iterating on all the loop's addresses if set to false.
 */

export const sendMailToAddresses = async (
  emailSubject: string,
  emailContent: string,
  addresses: string[],
  platformName: string,
  providedDataProtector: IExecDataProtector,
  providedWeb3mail: IExecWeb3mail,
  id?: string,
  emailType?: EmailType,
): Promise<{ successCount: number; errorCount: number }> => {
  console.log('Sending email to addresses');
  const privateKey = process.env.NEXT_WEB3MAIL_PLATFORM_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key is not set');
  }
  let sentCount = 0,
    nonSentCount = 0;
  let web3mail: IExecWeb3mail, dataProtector: IExecDataProtector;

  try {
    const sendPromises = addresses.map(address =>
      sendMarketingEmailTo(
        address,
        dataProtector,
        web3mail,
        emailSubject,
        emailContent,
        platformName,
      ),
    );

    const results = await Promise.all(sendPromises);

    results.forEach(result => {
      if (result.success === true) {
        if (id && emailType) {
          //TODO rename web3mail en "mail" ou "email" ?
          persistEmail(id, emailType);
        }
        sentCount++;
      } else {
        nonSentCount++;
      }
    });
  } catch (e) {
    //TODO is this try catch useful ?
    throwError(e);
  }
  return { successCount: sentCount, errorCount: nonSentCount };
};

const throwError = (message: any) => {
  throw new Error(message);
};

const sendMarketingEmailTo = async (
  address: string,
  dataProtector: IExecDataProtector,
  web3mail: IExecWeb3mail,
  emailSubject: string,
  emailContent: string,
  platformName: string,
) => {
  try {
    console.log(`------- Sending web3mail to ${address} -------`);

    // Check whether user granted access to his email
    const protectedEmailAddress = await userGaveAccessToPlatform(address, dataProtector);
    if (!protectedEmailAddress) {
      console.warn(`sendMailToAddresses - User ${address} did not grant access to his email`);
      return throwError('access denied');
    }

    const mailSent = await web3mail.sendEmail({
      protectedData: protectedEmailAddress,
      emailSubject: emailSubject,
      emailContent: emailContent,
      contentType: 'text/html',
      senderName: platformName,
    });
    console.log('sent email', mailSent);
    return { success: true };
  } catch (e: any) {
    console.log(e);
    return { success: false, error: e.message };
  }
};
