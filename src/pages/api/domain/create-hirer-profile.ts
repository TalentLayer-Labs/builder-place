import { NextApiRequest, NextApiResponse } from 'next';
import { CreateHirerProfileProps } from '../../../modules/BuilderPlace/types';
import { createHirerProfile } from '../../../modules/BuilderPlace/actions';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body: CreateHirerProfileProps = req.body;
    console.log('Received data:', body);

    const result = await createHirerProfile({
      ...body,
    });

    console.log('result: ', result);

    if (result.message) {
      res.status(200).json({ message: result.message, id: result._id });
    } else {
      res.status(400).json({ error: result.error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
