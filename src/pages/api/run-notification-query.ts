import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../postgre/postgreClient';
import { sendNewServiceNotification } from '../../modules/Notifications/discord';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const authHeader: string = req.headers.authorization as string
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(400).json({ error: "wrong cron secret provided" });
  }

  try {
    const newNotifications = await prisma?.discordNotification.findMany({ where: { status: 'NEW' } });
    if (!newNotifications) res.status(200).json({ message: "nothing to send" });

    newNotifications.forEach(async notification => {
      const result = await sendNewServiceNotification(notification.builderPlaceId as unknown as string, notification.cid);
      await prisma.discordNotification.update({ where: { id: notification.id }, data: { failReason: result?.errorMessage, status: result?.isSuccess ? "SUCCESS" : "FAIL" } })
    });

    res.status(200).json({ message: "done" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
