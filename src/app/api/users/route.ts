import { NextApiRequest, NextApiResponse } from 'next';
import { getUsersBy } from '../../../modules/BuilderPlace/actions/user';
import prisma from '../../../postgre/postgreClient';
import { IPostUser } from '../../../pages/landing/newonboarding/create-profile';
import { recoverMessageAddress } from 'viem';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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
  const body: IPostUser = await req.json();
  console.log('json', body);

  // @TODO: move it to a middleware and apply to all GET or POST ?
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.data.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.data.address) {
    return Response.json({ error: 'Signature invalid' }, { status: 401 });
  }

  try {
    const user = await prisma.user.create({
      data: body.data,
    });
    return Response.json({ id: user.id }, { status: 201 });
  } catch (error: any) {
    // @TODO: move error handle to a middleware ? or factorize it ?
    let message = 'Failed to create user';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A user already exist with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
