import { NextApiRequest, NextApiResponse } from 'next';
import { CreateHirerProfileProps } from '../../../modules/BuilderPlace/types';
import { getUserByEmail } from '../../../modules/BuilderPlace/actions/email';
import { createHirerProfile, updateHirerProfile } from '../../../modules/BuilderPlace/actions/user';

//TODO make it one API to create either worker or hirer ? Or update an existing User when declaring him collaborator ?
// Or pass as param if the guy is a hirer or worker ?
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body: CreateHirerProfileProps = req.body;
    console.log('Received data:', body);

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
        result = await updateHirerProfile({
          id: Number(existingProfile.id),
          ...body,
        });
      }

      res.status(200).json({ message: result.message, id: result.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
