import { recoverMessageAddress } from 'viem';
import prisma from '../../../../postgre/postgreClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IConfigurePlace } from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';
import { Prisma } from '.prisma/client';
import JsonNull = Prisma.NullTypes.JsonNull;
import InputJsonValue = Prisma.InputJsonValue;
import NullableJsonNullValueInput = Prisma.NullableJsonNullValueInput;

export async function GET(req: Request) {
  // TODO: implement GET
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IConfigurePlace = await req.json();

  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    console.log('Updating platform...', params.id);
    const builderPlace = await prisma.builderPlace.update({
      where: {
        id: Number(params.id),
      },
      //TODO why type issue ?
      data: {
        ...body.data,
        palette: body.data.palette as JsonNull | InputJsonValue | undefined,
        jobPostingConditions: body.data.jobPostingConditions as
          | NullableJsonNullValueInput
          | InputJsonValue
          | undefined,
        // palette: JSON.stringify(body.data.palette),
        // palette: { ...body.data.palette },
        // jobPostingConditions: { ...body.data.jobPostingConditions },
      },
    });

    return Response.json({ id: builderPlace?.id }, { status: 201 });
  } catch (error: any) {
    let message = 'Failed to create platform';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A platform already exists with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
