import { getBuilderPlaceFromOwner } from '../../BuilderPlace/request';
import { EmailType } from '.prisma/client';
import prisma from '../../../postgre/postgreClient';

const getTimestampNowSeconds = () => Math.floor(new Date().getTime() / 1000);

export const hasEmailBeenSent = async (id: string, emailType: EmailType): Promise<boolean> => {
  console.log(`---------------------- ${emailType} ${id} ----------------------`);
  const existingProposal = await prisma.web3Mail.findUnique({
    where: {
      id: `${id}-${emailType.toString()}`,
    },
    select: {
      id: true,
      sentAt: true,
      type: true,
    },
  });
  if (!existingProposal) {
    console.log('Notification not in DB');
    return false;
  }
  console.log('Notification already sent');
  return true;
};

export const persistEmail = async (id: string, emailType: EmailType) => {
  const compositeId = `${id}-${emailType.toString()}`;

  await prisma.web3Mail.upsert({
    where: {
      id: compositeId,
    },
    update: {
      sentAt: getTimestampNowSeconds(),
    },
    create: {
      id: compositeId,
      type: emailType,
      sentAt: getTimestampNowSeconds(),
    },
  });
};

export const persistCronProbe = async (
  emailType: EmailType,
  successCount: number,
  errorCount: number,
  cronDuration: number,
) => {
  const existingCronProbe = await prisma.cronProbe.findFirst({
    where: {
      type: emailType,
    },
  });
  if (existingCronProbe) {
    await prisma.cronProbe.update({
      where: {
        id: existingCronProbe.id,
      },
      data: {
        lastRanAt: getTimestampNowSeconds(),
        successCount: successCount,
        errorCount: errorCount,
        duration: cronDuration,
      },
    });
    return;
  }
  await prisma.cronProbe.create({
    data: {
      type: emailType,
      lastRanAt: getTimestampNowSeconds(),
      successCount: successCount,
      errorCount: errorCount,
      duration: cronDuration,
    },
  });
};

export const getWeb3mailCount = async (): Promise<number> => {
  return prisma.web3Mail.count();
};

//TODO test this
export const getWeb3mailCountByMonth = async (): Promise<{ _id: number; count: number }[]> => {
  const result: any =
    await prisma.$queryRaw`SELECT EXTRACT(MONTH FROM TO_TIMESTAMP(sentAt / 1000)) AS month, COUNT(*) AS count FROM Web3Mail GROUP BY month ORDER BY month;`;

  return result.map((item: any) => ({
    month: item.month ?? 0, // Use 0 as a default value if month is null
    count: item.count ?? 0, // Use 0 as a default value if count is null
  }));
};

export const getCronProbeCount = async (): Promise<number> => {
  return prisma.cronProbe.count();
};

export const getDomain = async (buyerTlId: string): Promise<string> => {
  const builderPlace = await getBuilderPlaceFromOwner(buyerTlId);
  return builderPlace?.customDomain || builderPlace?.subdomain;
};
