import { User } from '.prisma/client';
import { MAX_TRANSACTION_AMOUNT } from '../../config';
import prisma from '../../postgre/postgreClient';
import {
  ERROR_CHECKING_TRANSACTION_COUNTER,
  ERROR_EMAIL_NOT_VERIFIED,
  ERROR_INCREMENTING_TRANSACTION_COUNTER,
  TRANSACTION_LIMIT_REACHED,
} from '../../modules/BuilderPlace/apiResponses';
import { handleApiError } from './handleApiErrors';

export async function checkOrResetTransactionCounter(user: User): Promise<Response | void> {
  let status = 500;
  try {
    const nowMilliseconds = new Date().getTime();
    const oneWeekAgoMilliseconds = new Date(nowMilliseconds - 7 * 24 * 60 * 60 * 1000).getTime(); // 7 days ago

    if (user.counterStartDate > oneWeekAgoMilliseconds) {
      // Less than one week since counterStartDate
      if (user.weeklyTransactionCounter >= MAX_TRANSACTION_AMOUNT) {
        // If the counter is already 50, stop the function
        console.log(TRANSACTION_LIMIT_REACHED);
        status = 403;
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
    return handleApiError(error, ERROR_CHECKING_TRANSACTION_COUNTER, status);
  }
}

export async function incrementWeeklyTransactionCounter(user: User): Promise<Response | void> {
  let status = 500;
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
    return handleApiError(error, ERROR_INCREMENTING_TRANSACTION_COUNTER, status);
  }
}

export function checkUserEmailVerificationStatus(user: User): void | Response {
  if (!user.isEmailVerified) {
    console.log('Email not verified');
    return Response.json({ error: ERROR_EMAIL_NOT_VERIFIED }, { status: 401 });
  }
}
