import { NextApiRequest, NextApiResponse } from 'next';
import { CreateBuilderPlaceProps } from '../../../modules/BuilderPlace/types';
import { createBuilderPlace } from '../../../modules/BuilderPlace/actions';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const body: CreateBuilderPlaceProps = req.body;
    console.log('Received data:', body);
    try {
      const result = await createBuilderPlace({
        ...body,
      });

      res.status(200).json({ message: result.message, id: result.id });
    } catch (error: any) {
      //TODO check error sending, as of now we receive an empty object
      console.log('error in controller', error);
      res.status(400).json({ error: { ...error } });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
