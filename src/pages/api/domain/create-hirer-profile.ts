import { NextApiRequest, NextApiResponse } from 'next';
import { CreateHirerProfileProps } from '../../../modules/BuilderPlace/types';
import { createHirerProfile } from '../../../modules/BuilderPlace/actions';

//TODO make it one API to create either worker or hirer ? Or update an existing User when declaring him collaborator ?
// Or pass as param if the guy is a hirer or worker ?
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body: CreateHirerProfileProps = req.body;
    console.log('Received data:', body);

    try {
      const result = await createHirerProfile({
        ...body,
      });

      res.status(200).json({ message: result.message, id: result.id });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
