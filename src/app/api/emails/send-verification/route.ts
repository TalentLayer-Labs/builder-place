import { encrypt } from '../../../utils/email';
import {
  EMAIL_ALREADY_VERIFIED,
  VERIFICATION_EMAIL_SENT,
} from '../../../../modules/BuilderPlace/apiResponses';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';
import { sendTransactionalEmailValidation } from '../../../../pages/api/utils/sendgrid';

export interface ISendVerificationEmail {
  to: string;
  userId: string;
  name: string;
  domain: string;
}

/**
 * POST /api/emails/send-verification
 */
export async function POST(req: Request) {
  console.log('POST');
  const body: ISendVerificationEmail = await req.json();
  console.log('json', body);

  try {
    if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
      console.log(EMAIL_ALREADY_VERIFIED);
      return Response.json({ error: 'NEXT_PUBLIC_ROOT_DOMAIN is not defined' }, { status: 400 });
    }

    const hashedUserId = encrypt(body.userId);
    console.log('Encrypted userId', hashedUserId);

    await sendTransactionalEmailValidation(body.to, hashedUserId, body.name, body.domain);

    return Response.json(
      {
        message: VERIFICATION_EMAIL_SENT,
        hashedUserId: hashedUserId,
      },
      { status: 200 },
    );
  } catch (e: any) {
    const error = logAndReturnApiError(e, e.message);
    return Response.json({ error: error }, { status: 500 });
  }
}
