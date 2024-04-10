import { recoverMessageAddress } from 'viem';
import { getPlatformBy } from '../../../../../modules/BuilderPlace/actions/builderPlace';
import prisma from '../../../../../postgre/postgreClient';
import { logAndReturnApiError } from '../../../../utils/handleApiErrors';
import { ERROR_UPDATING_BUILDERPLACE } from '../../../../../modules/BuilderPlace/apiResponses';
import { ITransferPlatformOwnership } from '../../../../../pages/[domain]/admin/PlatformTransferForm';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * PUT /api/platforms/transfer-owner/[platformId]
 */
export async function PUT(req: Request, { params }: { params: { platformId: string } }) {
  console.log('PUT');
  const body: ITransferPlatformOwnership = await req.json();
  console.log('json', body);

  // Check if the signature is valid
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Check if the address is owner
  const builderPlace = await getPlatformBy({
    id: Number(params.platformId),
  });

  if (builderPlace?.owner?.address !== signatureAddress) {
    return Response.json({ error: 'The signer is not owner' }, { status: 401 });
  }

  const builderPlaceOwnerId = builderPlace?.owner?.id;

  try {
    console.log('Updating platform owner...', params.platformId);
    const builderPlace = await prisma.builderPlace.update({
      where: {
        id: Number(params.platformId),
      },
      data: {
        ...body.data,
        collaborators: {
          disconnect: { id: builderPlaceOwnerId },
          connect: { id: body.data.ownerId },
        },
      },
    });

    return Response.json({ id: builderPlace?.id }, { status: 200 });
  } catch (e: any) {
    let message = ERROR_UPDATING_BUILDERPLACE;
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const target = (e.meta?.target as string)[0] || 'data';
        message = `A platform already exists with this ${target}`;
      }
    }
    const error = logAndReturnApiError(e, message);
    return Response.json({ error: error }, { status: 500 });
  }
}
