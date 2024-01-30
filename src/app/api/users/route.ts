import { NextApiRequest, NextApiResponse } from 'next';
import { getUsersBy } from '../../../modules/BuilderPlace/actions/user';
import prisma from '../../../postgre/postgreClient';

export interface UsersFilters {
  id?: string | null;
  address?: string | null;
  email?: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: UsersFilters = {
    id: searchParams.get('id'),
    address: searchParams.get('address'),
    email: searchParams.get('email'),
  };
  const users = await getUsersBy(filters);

  return Response.json({ users });
}

export async function POST(req: Request) {
  console.log('POST');
  const data = await req.json();
  console.log('json', data);
  const user = await prisma.user.create({
    data: data,
  });

  return Response.json('Success!', { status: 201 });
}
