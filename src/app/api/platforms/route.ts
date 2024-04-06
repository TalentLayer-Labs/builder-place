import { Prisma } from '.prisma/client';
import { BuilderPlace, EntityStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { recoverMessageAddress } from 'viem';
import { ICreatePlatform } from '../../../components/onboarding/platform/CreatePlatformForm';
import prisma from '../../../postgre/postgreClient';
import JsonNull = Prisma.NullTypes.JsonNull;
import InputJsonValue = Prisma.InputJsonValue;
import { getPlatformsBy } from '../../../modules/BuilderPlace/actions/builderPlace';

export interface PlatformsFilters {
  id?: number | null;
  ownerId?: number | null;
  ownerTalentLayerId?: string | null;
  ownerAddress?: string | null;
  talentLayerPlatformId?: string | null;
  talentLayerPlatformName?: string | null;
  subdomain?: string | null;
}

/**
 * GET /api/platforms
 */
export async function GET(request: Request) {
  console.log('GET');
  const { searchParams } = new URL(request.url);
  const filters: PlatformsFilters = {
    id: Number(searchParams.get('id')),
    ownerId: Number(searchParams.get('ownerId')),
    ownerTalentLayerId: searchParams.get('ownerTalentLayerId'),
    ownerAddress: searchParams.get('ownerAddress'),
    talentLayerPlatformId: searchParams.get('talentLayerPlatformId'),
    talentLayerPlatformName: searchParams.get('talentLayerPlatformName'),
    subdomain: searchParams.get('subdomain'),
  };
  const platforms: BuilderPlace[] = await getPlatformsBy(filters);

  return Response.json({ platforms });
}

/**
 * POST /api/platforms
 */
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
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const builderPlace = await prisma.builderPlace.create({
      data: {
        ...body.data,
        palette: body.data.palette as unknown as JsonNull | InputJsonValue,
        status: EntityStatus.VALIDATED,
      },
    });

    await prisma.builderPlace.update({
      where: {
        id: Number(builderPlace.id),
      },
      data: {
        collaborators: {
          set: { id: Number(body.data.ownerId) },
        },
      },
    });

    return Response.json({ id: builderPlace.id }, { status: 201 });
  } catch (error: any) {
    // @TODO: move error handle to a middleware ? or factorize it ?
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
