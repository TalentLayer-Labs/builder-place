import { NextApiRequest, NextApiResponse } from 'next';
import { METHOD_NOT_ALLOWED, MISSING_DATA } from '../../../modules/BuilderPlace/apiResponses';
import { GetUserNotificationData } from '../../../modules/BuilderPlace/types';
import { checkOwnerSignature } from '../utils/domain';
import { getVerifiedUsersNotificationData } from '../../../modules/BuilderPlace/actions/user';
import { INotificationsPreferences } from '../../../types';

export interface IQueryData {
  id: number;
  address: string | null;
  email: string | null;
  name: string;
  emailPreferences: INotificationsPreferences;
}
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: METHOD_NOT_ALLOWED });
  }

  console.log('Received data:', req.body);
  const { builderPlaceId, ownerId, signature, notificationType }: GetUserNotificationData =
    req.body;

  if (!builderPlaceId || !ownerId || !signature || !notificationType) {
    return res.status(400).json({ error: MISSING_DATA });
  }

  try {
    await checkOwnerSignature(builderPlaceId, ownerId, signature, res);

    const result = await getVerifiedUsersNotificationData();

    const filteredUsers = result.filter(
      (data: IQueryData) => data.emailPreferences[notificationType] === true,
    );

    res.status(200).json({ data: filteredUsers });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
