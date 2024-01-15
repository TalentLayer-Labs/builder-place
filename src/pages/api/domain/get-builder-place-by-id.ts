import { NextApiRequest, NextApiResponse } from 'next';
import { getBuilderPlaceById } from '../../../modules/BuilderPlace/actions';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  //TODO whby this?
  // if (req.method === 'GET') {
  const body: { id: string } = req.body;
  console.log('Received data:', body);

  if (!body.id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  //TODO add condition for owner & collaborators ? Not needed in step 1 onboarding for example
  try {
    const result = await getBuilderPlaceById(body.id);
    res.status(200).json({ result: result });
  } catch (error: any) {
    res.status(400).json({ error: error });
  }
  // } else {
  //   res.status(405).json({ error: 'Method not allowed' });
  // }
}
