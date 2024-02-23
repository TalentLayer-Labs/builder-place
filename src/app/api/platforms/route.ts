import { BuilderPlace, EntityStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { recoverMessageAddress } from 'viem';
import { ICreateUser } from '../../../components/onboarding/user/CreateUserForm';
import { getUsersBy } from '../../../modules/BuilderPlace/actions/user';
import { sendTransactionalEmailValidation } from '../../../pages/api/utils/sendgrid';
import prisma from '../../../postgre/postgreClient';
import { ICreatePlatform } from '../../../components/onboarding/platform/CreatePlatformForm';

export interface PlatformsFilters {
  id?: string | null;
}

export async function GET(request: Request) {
  console.log('GET');
  const { searchParams } = new URL(request.url);
  const filters: PlatformsFilters = {
    id: searchParams.get('id'),
  };
  const platforms: BuilderPlace[] = [];
  // TODO call DB

  return Response.json({ platforms });
}

export async function POST(req: Request) {
  console.log('POST');
  const body: ICreatePlatform = await req.json();
  console.log('json', body);

  // @TODO: move it to a middleware and apply to all POST and PUT ?
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Signature invalid' }, { status: 401 });
  }

  try {
    const builderPlace = await prisma.builderPlace.create({
      data: { ...body.data, status: EntityStatus.VALIDATED },
    });

    return Response.json({ id: builderPlace.id }, { status: 201 });
  } catch (error: any) {
    // @TODO: move error handle to a middleware ? or factorize it ?
    let message = 'Failed to create plaform';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A plaform already exist with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
