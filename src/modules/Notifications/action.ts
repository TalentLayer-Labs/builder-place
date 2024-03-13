import prisma from '../../postgre/postgreClient';

export async function createDiscordNotificationEntry(cid: string, builderPlaceId: string) {
  try {
    await prisma.discordNotification.create({
      data: {
        cid: cid,
        builderPlaceId: Number(builderPlaceId),
      }
    });
    return {
      message: "Entry created successfully",
      cid: cid
    }
  } catch (error: any) {
    return {
      message: "notification not created successfully",
      cid: cid
    }
  }
}
