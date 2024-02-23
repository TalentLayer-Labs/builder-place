import { NextApiRequest, NextApiResponse } from 'next';
import { UpdateUserEmailPreferences } from '../../../modules/BuilderPlace/types';
import { updateUserNotificationsPreferences } from '../../../modules/BuilderPlace/actions/user';
import { recoverMessageAddress } from 'viem';
import { METHOD_NOT_ALLOWED, MISSING_DATA } from '../../../modules/BuilderPlace/apiResponses';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: METHOD_NOT_ALLOWED });
  }

  try {
    const body: UpdateUserEmailPreferences = req.body;
    console.log('Received data:', body);

    if (!body.userId || !body.preferences || !body.signature || !body.address) {
      return res.status(400).json({ error: MISSING_DATA });
    }

    const signatureAddress = await recoverMessageAddress({
      signature: body.signature,
      message: `connect with ${body.address}`,
    });

    if (signatureAddress !== body.address) {
      return res.status(401).json(`Invalid Signature`);
    }

    const preferences = body.preferences;

    await updateUserNotificationsPreferences({ address: signatureAddress, preferences });

    res.status(200).json({ message: 'User preferences updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
