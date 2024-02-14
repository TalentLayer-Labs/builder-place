import { recoverMessageAddress } from 'viem';
import prisma from '../../../../postgre/postgreClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IConfigurePlace } from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';

export async function GET(req: Request) {
  // TODO: implement GET
}

export async function PUT(req: Request) {
  console.log('PUT');
  const body: IConfigurePlace = await req.json();
  console.log('json', body);
  const { searchParams } = new URL(req.url);
  console.log('searchParams', searchParams);

  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Signature invalid' }, { status: 401 });
  }

  try {
    const builderPlace = await prisma.builderPlace.update({
      where: {
        id: Number(body.data.builderPlaceId),
      },
      data: { ...body.data, palette: JSON.stringify(body.data.palette) },
    });

    return Response.json({ id: builderPlace.id }, { status: 201 });
  } catch (error: any) {
    let message = 'Failed to create platform';
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string)[0] || 'data';
        message = `A platform already exist with this ${target}`;
      }
    }

    return Response.json({ message, error }, { status: 500 });
  }
}
