import prisma from '../../../../postgre/postgreClient';
import { decrypt } from '../../../utils/email';
import {
  EMAIL_ALREADY_VERIFIED,
  EMAIL_VERIFIED_SUCCESSFULLY,
} from '../../../../modules/BuilderPlace/apiResponses';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';

export interface IVerifyEmail {
  emailVerificationHash: string;
}

/**
 * POST /api/emails/verify
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: IVerifyEmail = await req.json();
  console.log('json', body);

  try {
    const userId = decrypt(body.emailVerificationHash);
    console.log('Decrypted userId', userId);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
    });

    if (existingUser?.isEmailVerified === true) {
      console.log(EMAIL_ALREADY_VERIFIED);
      return Response.json({ error: EMAIL_ALREADY_VERIFIED }, { status: 400 });
    }

    const resp = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        isEmailVerified: true,
      },
    });

    console.log('Validated user email', resp.id, resp.name, resp.email);

    return Response.json(
      {
        message: EMAIL_VERIFIED_SUCCESSFULLY,
        id: userId,
      },
      { status: 200 },
    );
  } catch (e: any) {
    const error = logAndReturnApiError(e, e.message);
    return Response.json({ error: error }, { status: 500 });
  }
}
