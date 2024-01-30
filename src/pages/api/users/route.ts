import { NextApiRequest, NextApiResponse } from 'next';
import { getUserBy } from '../../../modules/BuilderPlace/actions/user';
import prisma from '../../../postgre/postgreClient';

export interface UserFilters {
  id?: string;
  address?: string;
  email?: string;
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const filters: UserFilters = req.query;
  const users = await getUserBy(filters);
  res.status(200).json(users);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const user = await prisma.user.create({
    data: req.body,
  });
  res.status(201).json({ message: 'User created' });
}
