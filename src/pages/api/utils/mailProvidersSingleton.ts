import { NotificationType, MailProviders } from '../../../types';
import { getWeb3Provider as getMailProvider, IExecWeb3mail } from '@iexec/web3mail';
import { getWeb3Provider as getProtectorProvider, IExecDataProtector } from '@iexec/dataprotector';
import * as sgMail from '@sendgrid/mail';

//TODO check if need 2 functions
let providers: MailProviders = {
  sendGrid: undefined,
  web3mail: undefined,
  dataProtector: undefined,
};

const APIKEY = process.env.NEXT_PRIVATE_SENDGRID_API_KEY;

sgMail.setApiKey(APIKEY as string);
const initializeWeb3Providers = (privateKey: string) => {
  if (!providers.web3mail || !providers.dataProtector) {
    providers.web3mail = new IExecWeb3mail(getMailProvider(privateKey));
    providers.dataProtector = new IExecDataProtector(getProtectorProvider(privateKey));
  }
};

const initializeSendGridProvider = () => {
  if (!providers.sendGrid) {
    providers.sendGrid = sgMail;
  }
};

export const generateMailProviders = (
  notificationType: NotificationType,
  privateKey?: string,
): MailProviders => {
  try {
    if (notificationType === NotificationType.WEB3 && privateKey) {
      initializeWeb3Providers(privateKey);
    } else if (notificationType === NotificationType.WEB2) {
      initializeSendGridProvider();
    }
    return providers;
  } catch (error) {
    console.error('Error initializing mail providers:', error);
    throw error;
  }
};
