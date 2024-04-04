import { User } from '.prisma/client';
import prisma from '../../postgre/postgreClient';
import {
  ERROR_CHECKING_TRANSACTION_COUNTER,
  TRANSACTION_LIMIT_REACHED,
} from '../../modules/BuilderPlace/apiResponses';
import { logAndReturnApiError } from './handleApiErrors';
import Cryptr from 'cryptr';

let cryptr: Cryptr | undefined;
if (process.env.NEXT_PRIVATE_EMAIL_ENCRYPT_SECRET) {
  cryptr = new Cryptr(process.env.NEXT_PRIVATE_EMAIL_ENCRYPT_SECRET as string);
}
export const encrypt = (input: string): string => {
  console.log(
    'process.env.NEXT_PRIVATE_EMAIL_ENCRYPT_SECRET',
    process.env.NEXT_PRIVATE_EMAIL_ENCRYPT_SECRET,
  );
  if (!cryptr) {
    throw new Error('Cryptr not initialized');
  }
  return cryptr.encrypt(input);
};

export const decrypt = (input: string): string => {
  if (!cryptr) {
    throw new Error('Cryptr not initialized');
  }
  return cryptr.decrypt(input);
};

export async function checkOrResetTransactionCounter(user: User): Promise<void> {
  try {
    const maxFreeTransactions = Number(
      process.env.NEXT_PUBLIC_MAX_FREE_WEEKLY_GASSLESS_TRANSACTIONS,
    );
    const nowSeconds = Math.floor(Date.now() / 1000);
    const oneWeekAgoSeconds = nowSeconds - 7 * 24 * 60 * 60; // 7 days ago in seconds

    if (user.counterStartDate > oneWeekAgoSeconds) {
      if (user.weeklyTransactionCounter >= maxFreeTransactions) {
        console.log(TRANSACTION_LIMIT_REACHED);
        throw new Error(TRANSACTION_LIMIT_REACHED);
      }
    } else {
      console.log('More than a week since the start date, reset counter');
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          counterStartDate: nowSeconds,
          weeklyTransactionCounter: 0,
        },
      });
    }
    console.log('Delegating transaction');
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_CHECKING_TRANSACTION_COUNTER);
    throw new Error(error);
  }
}

export async function incrementWeeklyTransactionCounter(user: User): Promise<void> {
  try {
    const maxFreeTransactions = Number(
      process.env.NEXT_PUBLIC_MAX_FREE_WEEKLY_GASSLESS_TRANSACTIONS,
    );

    const newWeeklyTransactionCounter =
      user.weeklyTransactionCounter === maxFreeTransactions
        ? 1
        : (user.weeklyTransactionCounter || 0) + 1;

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        weeklyTransactionCounter: newWeeklyTransactionCounter,
      },
    });
    console.log('Transaction counter incremented', newWeeklyTransactionCounter);
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_CHECKING_TRANSACTION_COUNTER);
    throw new Error(error);
  }
}
