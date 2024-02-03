import { NextApiRequest, NextApiResponse } from 'next';
import { METHOD_NOT_ALLOWED, MISSING_DATA } from '../../../modules/BuilderPlace/apiResponses';
import { GetUserEmails } from '../../../modules/BuilderPlace/types';
import { checkOwnerSignature } from '../utils/domain';
import { getVerifiedUsersAddresses } from '../../../modules/BuilderPlace/actions/user';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: METHOD_NOT_ALLOWED });
  }

  const body: GetUserEmails = req.body;
  console.log('Received data:', body);

  if (!body) {
    return res.status(400).json({ error: MISSING_DATA });
  }

  try {
    await checkOwnerSignature(body.builderPlaceId, body.ownerId, body.signature, res);

    const result = await getVerifiedUsersAddresses();
    res.status(200).json({ addresses: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
