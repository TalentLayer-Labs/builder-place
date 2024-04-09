import { recoverMessageAddress } from 'viem';
import { ERROR_UPDATING_USER } from '../../../../modules/BuilderPlace/apiResponses';
import prisma from '../../../../postgre/postgreClient';
import { IMutation } from '../../../../types';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';

export interface UsersFields {
  // email?: string | null;
  //TODO complete
  emailPreferences?: PrismaJson.EmailPreferences;
}
export interface IUpdateProfile extends IMutation<UsersFields> {}

/**
 * GET /api/users
 */
export async function GET(req: Request) {
  // TODO: implement GET
}

/**
 * PUT /api/users
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log('PUT');
  const body: IUpdateProfile = await req.json();

  // Check if the signature is valid
  const signatureAddress = await recoverMessageAddress({
    message: `connect with ${body.address}`,
    signature: body.signature,
  });

  if (signatureAddress !== body.address) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    console.log('Updating profile...', params.id);
    const user = await prisma.user.update({
      where: {
        id: Number(params.id),
      },
      data: body.data,
    });

    return Response.json({ id: user?.id }, { status: 200 });
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_UPDATING_USER);
    return Response.json({ error: error }, { status: 500 });
  }
}
