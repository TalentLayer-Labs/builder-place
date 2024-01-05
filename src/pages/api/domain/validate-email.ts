import { NextApiRequest, NextApiResponse } from 'next';
import { validateWorkerProfileEmail } from '../../../modules/BuilderPlace/actions';
import { ValidateEmail } from '../../../modules/BuilderPlace/types';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: ValidateEmail = req.body;
    console.log('Received data:', body);

    try {
      const result = await validateWorkerProfileEmail(body.userId);
      if (result?.error) {
        res.status(400).json({ error: result.error });
      } else {
        res.status(200).json({ message: result.message, email: result.email });
      }
    } catch (err: any) {
      console.error(err);
      res.status(err.httpCode || 400).end(String(err));
      return;
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
