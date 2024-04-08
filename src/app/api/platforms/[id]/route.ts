import { Prisma } from '.prisma/client';
import { recoverMessageAddress } from 'viem';
import { IConfigurePlace } from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';
import { getPlatformBy } from '../../../../modules/BuilderPlace/actions/builderPlace';
import prisma from '../../../../postgre/postgreClient';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';
import { ERROR_REMOVING_BUILDERPLACE_OWNER } from '../../../../modules/BuilderPlace/apiResponses';
import JsonNull = Prisma.NullTypes.JsonNull;
import InputJsonValue = Prisma.InputJsonValue;
import NullableJsonNullValueInput = Prisma.NullableJsonNullValueInput;

export async function GET(req: Request) {
  // TODO: implement GET
}

/**
 * PUT /api/platforms
 */
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
  const builderPlace = await getPlatformBy({
    collaboratorAddress: signatureAddress,
    id: Number(params.id),
  });

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
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_REMOVING_BUILDERPLACE_OWNER);
    return Response.json({ error: error }, { status: 500 });
  }
}
