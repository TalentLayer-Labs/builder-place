import { NextApiRequest, NextApiResponse } from 'next';
import { CreateWorkerProfileProps } from '../../../modules/BuilderPlace/types';
import {
  createHirerProfile,
  getUserByEmail,
  updateWorkerProfile,
} from '../../../modules/BuilderPlace/actions';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body: CreateWorkerProfileProps = req.body;
    console.log('Received data:', body);

    /**
     * @dev: Checks on existing user with same email. If Pending, will delete the pending user and create a new one.
     * If Validated, will return an error.
     */
    try {
      const existingProfile = await getUserByEmail(body.email);

      if (existingProfile && existingProfile.status === 'VALIDATED') {
        res.status(400).json({ error: 'A profile with this email already exists' });
        return;
      }

      let result;
      if (!existingProfile) {
        result = await createHirerProfile({
          ...body,
        });
      } else {
        result = await updateWorkerProfile({
          id: Number(existingProfile.id),
          ...body,
        });
      }

      res.status(200).json({ message: result.message, id: result.id });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
