import { NextApiRequest, NextApiResponse } from 'next';
import { updateBuilderPlace } from '../../../modules/BuilderPlace/actions';
import { UpdateBuilderPlace } from '../../../modules/BuilderPlace/types';
import { checkSignature } from '../utils/domain';
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: UpdateBuilderPlace = req.body;
    console.log('Received data:', body);
    // Check whether the address which provided the signature is an admin of the domain
    await checkSignature(body.builderPlaceId, body.signature, res);

    const result = await updateBuilderPlace(body);

    if (result?.error) {
      res.status(400).json({ error: result.error });
    } else {
      res.status(200).json({ message: 'BuilderPlace domain updated successfully', id: result.id });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
