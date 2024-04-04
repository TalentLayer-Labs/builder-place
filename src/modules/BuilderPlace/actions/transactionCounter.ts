import { User } from '.prisma/client';
import { NextApiResponse } from 'next';
import {
  ERROR_CHECKING_TRANSACTION_COUNTER,
  ERROR_INCREMENTING_TRANSACTION_COUNTER,
  TRANSACTION_LIMIT_REACHED,
} from '../apiResponses';
import prisma from '../../../postgre/postgreClient';
import { handleApiError } from '../utils/error';

export async function checkOrResetTransactionCounter(
  user: User,
  res: NextApiResponse,
): Promise<void> {
  let errorMessage = '';
  try {
    const maxFreeTransactions = Number(
      process.env.NEXT_PUBLIC_MAX_FREE_WEEKLY_GASSLESS_TRANSACTIONS,
    );
    const nowMilliseconds = new Date().getTime();
    const oneWeekAgoMilliseconds = new Date(nowMilliseconds - 7 * 24 * 60 * 60 * 1000).getTime(); // 7 days ago

    if (user.counterStartDate > oneWeekAgoMilliseconds) {
      // Less than one week since counterStartDate
      if (user.weeklyTransactionCounter >= maxFreeTransactions) {
        // If the counter is already 50, stop the function
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
          counterStartDate: nowMilliseconds,
          weeklyTransactionCounter: 0,
        },
      });
    }
    console.log('Delegating transaction');
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_CHECKING_TRANSACTION_COUNTER, res);
  }
}

export async function incrementWeeklyTransactionCounter(
  user: User,
  res: NextApiResponse,
): Promise<void> {
  let errorMessage = '';
  try {
    // Increment the counter
    const newWeeklyTransactionCounter = (user.weeklyTransactionCounter || 0) + 1;
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        weeklyTransactionCounter: newWeeklyTransactionCounter,
      },
    });
    console.log('Transaction counter incremented', newWeeklyTransactionCounter);
  } catch (error: any) {
    handleApiError(error, errorMessage, ERROR_INCREMENTING_TRANSACTION_COUNTER, res);
  }
}
