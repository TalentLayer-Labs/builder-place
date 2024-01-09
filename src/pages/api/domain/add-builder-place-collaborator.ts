import { NextApiRequest, NextApiResponse } from 'next';
import { addBuilderPlaceCollaborator } from '../../../modules/BuilderPlace/actions';
import { AddBuilderPlaceCollaborator } from '../../../modules/BuilderPlace/types';
import { checkOwnerSignature } from '../utils/domain';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: AddBuilderPlaceCollaborator = req.body;
    console.log('Received data:', body);
    try {
      await checkOwnerSignature(body.builderPlaceId, body.ownerId, body.signature, res);

      const result = await addBuilderPlaceCollaborator(body);
      res.status(200).json({ message: result.message, address: result.address, id: result.id });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
