import { NextApiResponse } from 'next';

export const handleApiError = (
  caughtError: any,
  errorMessage: string,
  customErrorMessage: string,
  res?: NextApiResponse,
) => {
  if (caughtError?.name?.includes('Prisma')) {
    errorMessage = customErrorMessage;
  } else {
    errorMessage = caughtError.message;
  }
  if (res) {
    console.log(caughtError.message);
    res.status(500).json({ error: errorMessage });
  } else {
    console.log(caughtError.message);
    throw new Error(errorMessage);
  }
};
