import { NextApiRequest, NextApiResponse } from 'next';
import { METHOD_NOT_ALLOWED, MISSING_DATA } from '../../../modules/BuilderPlace/apiResponses';
import { GetUserEmailData } from '../../../modules/BuilderPlace/types';
import { checkOwnerSignature } from '../utils/domain';
import { getVerifiedUsersEmailData } from '../../../modules/BuilderPlace/actions/user';

export interface IQueryData {
  id: number;
  address: string | null;
  email: string | null;
  name: string;
  skills: string[];
  emailPreferences: PrismaJson.EmailPreferences;
  workerProfile: { id: number; skills: string[] } | null;
}
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: METHOD_NOT_ALLOWED });
  }

  console.log('Received data:', req.body);
  const {
    builderPlaceId,
    ownerId,
    signature,
    emailNotificationType,
    address,
    includeSkills,
  }: GetUserEmailData = req.body;

  if (!builderPlaceId || !ownerId || !signature || !emailNotificationType || !address) {
    return res.status(400).json({ error: MISSING_DATA });
  }

  try {
    await checkOwnerSignature(builderPlaceId, ownerId, signature, address, res);

    const result = await getVerifiedUsersEmailData(includeSkills);

    const filteredUsers = result?.filter(
      (data: IQueryData) => data.emailPreferences[emailNotificationType] === true,
    );

    res.status(200).json({ data: filteredUsers });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
