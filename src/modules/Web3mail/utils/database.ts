import { EmailSender, EmailType } from '.prisma/client';
import prisma from '../../../postgre/postgreClient';

const getTimestampNowSeconds = () => Math.floor(new Date().getTime() / 1000);

export const hasEmailBeenSent = async (id: string, emailType: EmailType): Promise<boolean> => {
  console.log(`---------------------- ${emailType} ${id} ----------------------`);
  const existingProposal = await prisma.mail.findUnique({
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

export const persistEmail = async (id: string, emailType: EmailType, sender: EmailSender) => {
  const compositeId = `${id}-${emailType.toString()}`;
  console.log('Persisting email ', compositeId);

  await prisma.mail.upsert({
    where: {
      id: compositeId,
    },
    update: {
      sentAt: new Date(),
    },
    create: {
      id: compositeId,
      type: emailType,
      sentAt: new Date(),
      sender: sender,
    },
  });
};

export const persistCronProbe = async (
  emailType: EmailType,
  successCount: number,
  errorCount: number,
  cronDuration: number,
) => {
  await prisma.cronProbe.upsert({
    where: {
      type: emailType, // `type` is unique
    },
    update: {
      lastRanAt: new Date(),
      successCount: successCount,
      errorCount: errorCount,
      duration: cronDuration,
    },
    create: {
      type: emailType,
      lastRanAt: new Date(),
      successCount: successCount,
      errorCount: errorCount,
      duration: cronDuration,
    },
  });
};

export const getWeb3mailCount = async (): Promise<number> => {
  return prisma.mail.count();
};

export const getWeb3mailCountByMonth = async (): Promise<number[]> => {
  const currentYear = new Date().getFullYear();

  const web3Mails = await prisma.mail.findMany({
    where: {
      sentAt: {
        gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
        lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
      },
    },
    select: {
      sentAt: true,
    },
  });

  // Initialize the counts array with zeros for each month
  const counts: number[] = Array(12).fill(0);

  web3Mails.forEach((mail: { sentAt: Date }) => {
    const monthIndex = mail.sentAt.getMonth(); // getMonth() is zero-indexed, so January is 0
    counts[monthIndex]++;
  });

  // Now counts array has the count of emails from index 0 to 11 for each month
  return counts;

  // If we want old format
  // const countPerMonth = web3Mails.reduce(
  //   (
  //     acc: Record<
  //       number,
  //       {
  //         _id: number;
  //         count: number;
  //       }
  //     >,
  //     mail: { sentAt: Date },
  //   ) => {
  //     const month = mail.sentAt.getMonth(); // getMonth() is zero-indexed
  //     const monthId = month + 1; // Convert to one-indexed month ID
  //
  //     if (!acc[monthId]) {
  //       acc[monthId] = { _id: monthId, count: 0 };
  //     }
  //
  //     acc[monthId].count++;
  //
  //     return acc;
  //   },
  //   {},
  // );
  //
  // // Convert object to array
  // const result = Object.values(countPerMonth);
};

export const getCronProbeCount = async (): Promise<number> => {
  return prisma.cronProbe.count();
};
