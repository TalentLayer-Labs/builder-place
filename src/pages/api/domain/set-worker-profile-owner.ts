import { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, getUserByTalentLayerId } from '../../../modules/BuilderPlace/actions';
import { SetUserProfileOwner } from '../../../modules/BuilderPlace/types';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const body: SetUserProfileOwner = req.body;
    console.log('Received data:', body);

    if (!body.id || !body.talentLayerId) {
      return res.status(500).json({ error: 'Missing data.' });
    }

    //TODO make this by address, anyone can set any id they want => No since this would require a user signature. And we want no signature.
    const existingProfile = await getUserByTalentLayerId(body.talentLayerId);
    if (existingProfile) {
      return res.status(401).json({ error: 'You already have a profile' });
    }

    const userProfile = await getUserById(body.id as string);
    if (!userProfile) {
      return res.status(400).json({ error: "Profile doesn't exist." });
    }
    if (!!userProfile.talentLayerId) {
      return res.status(401).json({ error: 'Profile already has an owner.' });
    }

    try {
      userProfile.talentLayerId = body.talentLayerId;
      userProfile.status = 'validated';
      userProfile.save();
      res.status(200).json({ message: 'Worker Profile updated successfully', id: userProfile._id });
    } catch (error: any) {
      res.status(400).json({ error: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
