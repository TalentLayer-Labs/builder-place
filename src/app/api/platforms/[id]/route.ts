import { recoverMessageAddress } from 'viem';
import prisma from '../../../../postgre/postgreClient';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { IConfigurePlace } from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';
import { Prisma } from '.prisma/client';
import JsonNull = Prisma.NullTypes.JsonNull;
import InputJsonValue = Prisma.InputJsonValue;
import NullableJsonNullValueInput = Prisma.NullableJsonNullValueInput;
import { getBuilderPlaceByCollaboratorAddressAndId } from '../../../../modules/BuilderPlace/actions/builderPlace';

export async function GET(req: Request) {
  // TODO: implement GET
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IConfigurePlace = await req.json();

  // Check if the signature is valid
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Check if the address is owner or collaborator
  const builderPlace = await getBuilderPlaceByCollaboratorAddressAndId(signatureAddress, params.id);

  if (!builderPlace) {
    return Response.json({ error: 'The signer is not owner or collaborator' }, { status: 401 });
  }

  try {
    console.log('Updating platform...', params.id);
    const builderPlace = await prisma.builderPlace.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...body.data,
        palette: body.data.palette as JsonNull | InputJsonValue | undefined,
        jobPostingConditions: body.data.jobPostingConditions as
          | NullableJsonNullValueInput
          | InputJsonValue
          | undefined,
      },
    });

    return Response.json({ id: builderPlace?.id }, { status: 200 });
  } catch (error: any) {
    let message = 'Failed to update platform';
    return Response.json({ message, error }, { status: 500 });
  }
}
