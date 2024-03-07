import { NextApiResponse } from 'next';
import { getWeb3Provider as getMailProvider, IExecWeb3mail } from '@iexec/web3mail';
import { getWeb3Provider as getProtectorProvider, IExecDataProtector } from '@iexec/dataprotector';
import { IUserDetails, EmailNotificationType } from '../../../types';

export class EmptyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmptyError';
  }
}

export const prepareCronApi = (
  notificationType: EmailNotificationType,
  chainId: string | undefined,
  platformId: string | undefined,
  databaseUrl: string | undefined,
  cronSecurityKey: string | undefined,
  privateKey: string | undefined,
  res: NextApiResponse,
): void => {
  if (notificationType === EmailNotificationType.WEB3 && !privateKey) {
    console.warn('Web3mail Private key is not set');
    return res.status(500).json('Server error');
  }

  if (!(cronSecurityKey == `Bearer ${process.env.CRON_SECRET}`)) {
    console.warn('Unauthorized');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!chainId) {
    console.warn('Chain Id is not set');
    return res.status(500).json('Chain Id is not set');
  }

  if (!databaseUrl) {
    console.warn('Database URL is not set');
    return res.status(500).json('Database URL is not set');
  }

  if (!platformId) {
    console.warn('Platform Id is not set');
    return res.status(500).json('Platform Id is not set');
  }
};

export const prepareNonCronApi = (
  notificationType: EmailNotificationType,
  chainId: string | undefined,
  platformId: string | undefined,
  privateKey: string | undefined,
  res: NextApiResponse,
): void => {
  if (notificationType === EmailNotificationType.WEB3 && !privateKey) {
    console.warn('Web3mail Private key is not set');
    return res.status(500).json('Server error');
  }

  if (!chainId) {
    console.warn('Chain Id is not set');
    return res.status(500).json('Chain Id is not set');
  }

  if (!platformId) {
    console.warn('Platform Id is not set');
    return res.status(500).json('Platform Id is not set');
  }
};

export const generateWeb3mailProviders = (
  privateKey: string,
): { dataProtector: IExecDataProtector; web3mail: IExecWeb3mail } => {
  const mailWeb3Provider = getMailProvider(privateKey);
  const web3mail = new IExecWeb3mail(mailWeb3Provider);
  const protectorWebProvider = getProtectorProvider(privateKey);
  const dataProtector = new IExecDataProtector(protectorWebProvider);
  return { dataProtector, web3mail };
};

//TODO with new graph event this can be optimized
export const getValidUsers = (userDescriptions: IUserDetails[]): string[] => {
  // Only select the latest version of each user metaData
  const validUsers = userDescriptions.filter(
    userDetails => userDetails.user?.description?.id === userDetails.id,
  );
  return validUsers.map(userDetails => userDetails.user.address);
};
