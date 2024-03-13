export const handleApiError = (caughtError: any, customErrorMessage: string, status: number) => {
  let errorMessage = '';
  //TODO do it cleaner with type check
  if (caughtError?.name?.includes('Prisma')) {
    //Keep message simple is error from Prisma
    errorMessage = customErrorMessage;
  } else {
    errorMessage = caughtError.message;
  }
  console.log(caughtError.message);
  return Response.json({ error: errorMessage }, { status: status });
};
