import { recoverMessageAddress } from 'viem';
import prisma from '../../../../postgre/postgreClient';
import { logAndReturnApiError } from '../../../utils/handleApiErrors';
import { ERROR_UPDATING_USER } from '../../../../modules/BuilderPlace/apiResponses';
import { IEmailPreferences, IMutation } from '../../../../types';
import { sendTransactionalEmailValidation } from '../../../../pages/api/utils/sendgrid';

export interface UsersFields {
  name?: string;
  email?: string;
  about?: string;
  picture?: string;
  video?: string;
  title?: string;
  role?: string;
  workerProfileFields?: WorkerProfileFields;
  emailPreferences?: IEmailPreferences | null;
}

interface WorkerProfileFields {
  skills?: string[];
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

    // Fetch current user data from the database
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(params.id) },
    });

    if (!currentUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { workerProfileFields, emailPreferences, ...userDataFields } = body.data;

    const isEmailUpdated = !!userDataFields.email && userDataFields.email !== currentUser.email;

    let updatedUserDataFields = {
      ...userDataFields,
      // Reset isEmailVerified if email is updated
      ...(isEmailUpdated && { isEmailVerified: false }),
    };

    console.log('userDataFields', updatedUserDataFields);
    console.log('isEmailUpdated', isEmailUpdated);
    console.log('emailPreferences', emailPreferences);
    console.log('userDataFields', userDataFields);

    // Update User data
    const user = await prisma.user.update({
      where: {
        id: Number(params.id),
      },
      data: {
        ...updatedUserDataFields,
        emailPreferences: { ...emailPreferences },
      },
    });

    // Update or create WorkerProfile if skills are provided
    if (workerProfileFields?.skills) {
      await prisma.workerProfile.upsert({
        where: { id: Number(params.id) },
        update: { skills: workerProfileFields.skills },
        create: {
          id: Number(params.id),
          skills: workerProfileFields.skills,
        },
      });
    }

    // Send validation email if email is updated
    if (isEmailUpdated)
      await sendTransactionalEmailValidation(
        user.email,
        user.id.toString(),
        user.name,
        body?.domain,
      );

    return Response.json({ id: user?.id }, { status: 200 });
  } catch (e: any) {
    const error = logAndReturnApiError(e, ERROR_UPDATING_USER);
    return Response.json({ error: error }, { status: 500 });
  }
}
