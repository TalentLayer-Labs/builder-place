import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext, useEffect } from 'react';
import { useChainId, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../../context/talentLayer';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';
import useCreateUser from '../../../modules/BuilderPlace/hooks/user/useCreateUser';
import { IMutation } from '../../../types';
import { showErrorTransactionToast } from '../../../utils/toast';
import { HandleInput } from '../../Form/HandleInput';
import Loading from '../../Loading';
import UploadImage from '../../UploadImage';
import { EntityStatus } from '@prisma/client';

export interface ICreateUserFormValues {
  name: string;
  talentLayerHandle: string;
  email: string;
  picture?: string;
}

export interface ICreateUser
  extends IMutation<
    ICreateUserFormValues & {
      address: string;
    }
  > {}

/**
 * @dev This form aims to be used for all profile onboarding (worker, builder space owner, collaborator, hirer).
 *
 * Logicall flow:
 *
 * IF user has a wallet connected
 *      EXECUTE REQUEST: We try to get from DB his user profile
 *      IF user has profile in DB with this wallet and the account is validated
 *         execute success callback
 *      ELSE
 *          Let the user complete the form, we will create a profile in DB (and a TalentLayerID if the wallet don't have one yet)
 *  ELSE
 *     let the user complete the form and ask him to conenct on submit
 */
function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { loading: isLoadingUser, user, address, getUser } = useContext(UserContext);
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const { open: openConnectModal } = useWeb3Modal();
  const { createNewUser } = useCreateUser();

  /**
   * @dev if user already got an account, we redirect him to the next step
   */
  useEffect(() => {
    if (user && user.status == EntityStatus.VALIDATED) {
      onSuccess();
    }
  }, [user]);

  const initialValues: ICreateUserFormValues = {
    name: user?.name || talentLayerUser?.description?.name || talentLayerUser?.handle || '',
    talentLayerHandle: talentLayerUser?.handle || user?.talentLayerHandle || '',
    email: user?.email || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(5).max(20).required('Enter your name'),
    email: Yup.string().required('Enter your email'),
    talentLayerHandle: Yup.string()
      .min(5)
      .max(20)
      .matches(/^[a-z0-9][a-z0-9-_]*$/, 'Only a-z, 0-9 and -_ allowed, and cannot begin with -_')
      .required('Enter your handle'),
  });

  const handleSubmit = async (
    values: ICreateUserFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      setSubmitting(true);

      await createNewUser(values);
      await getUser();

      /**
       * @dev Depending on context, we will redirect to the right path. This could be an argument of the function. Globally a callback.
       */
      onSuccess();
    } catch (error: any) {
      console.log('CATCH error', error);
      showErrorTransactionToast(error);
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    }
  };

  if (isLoadingUser) {
    return <Loading />;
  }

  return (
    <div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}>
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className='grid grid-cols-1 gap-3 sm:gap-4'>
              <label className='block'>
                <span className='font-bold text-md'>name*</span>
                <Field
                  type='text'
                  id='name'
                  name='name'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='your name'
                />
                <span className='text-red-500'>
                  <ErrorMessage name='name' />
                </span>
              </label>

              <label className='block'>
                <span className='font-bold text-md'>handle* </span>
                <HandleInput
                  initiaValue={initialValues.talentLayerHandle}
                  existingHandle={talentLayerUser?.handle}
                />
                <span className='text-red-500'>
                  <ErrorMessage name='talentLayerHandle' />
                </span>
                <p className='font-alt text-xs font-normal'>
                  <span className='text-base-content'>
                    Used to create your onchain identity on{' '}
                    <a
                      href='https://talentlayer.org'
                      target='_blank'
                      className='underline text-info'>
                      TalentLayer
                    </a>
                    .
                  </span>
                </p>
              </label>

              <label className='block'>
                <span className='font-bold text-md'>email*</span>
                <Field
                  type='email'
                  id='email'
                  name='email'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='your email'
                />
                <span className='text-red-500'>
                  <ErrorMessage name='email' />
                </span>
              </label>

              <UploadImage
                fieldName='picture'
                label='profile picture'
                legend='optimal with square format'
                src={values.picture}
                setFieldValue={setFieldValue}
              />

              {isSubmitting ? (
                <button
                  disabled
                  type='submit'
                  className='grow px-5 py-2 rounded-xl bg-pink-300 text-white'>
                  Loading...
                </button>
              ) : (
                <>
                  {address ? (
                    <button
                      type='submit'
                      className='grow px-5 py-2 rounded-xl bg-pink-500 text-white'>
                      create my profile
                    </button>
                  ) : (
                    <button
                      className='grow px-5 py-2 rounded-xl bg-black text-white'
                      onClick={() => {
                        openConnectModal();
                      }}>
                      connect your wallet first
                    </button>
                  )}
                </>
              )}
            </div>
          </Form>
        )}
      </Formik>

      {!address && (
        <p className='mt-4'>
          Already got a profile?{' '}
          <button
            onClick={() => {
              openConnectModal();
            }}>
            <a className='text-block underline'>connect now</a>
          </button>
        </p>
      )}
    </div>
  );
}

export default CreateUserForm;
