'use client';

import { EntityStatus } from '@prisma/client';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext, useEffect } from 'react';
import { useAccount } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../../context/talentLayer';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';
import useCreateUser from '../../../modules/BuilderPlace/hooks/user/useCreateUser';
import { IMutation } from '../../../types';
import { showErrorTransactionToast } from '../../../utils/toast';
import { HandleInput } from '../../Form/HandleInput';
import Loading from '../../Loading';
import UploadImage from '../../UploadImage';

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
      talentLayerId: string;
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
 *     let the user complete the form and ask him to connect on submit
 */
function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const { address } = useAccount();
  const { loading: isLoadingUser, user, getUser } = useContext(UserContext);
  const { user: talentLayerUser, refreshData } = useContext(TalentLayerContext);
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

  const initialName = user?.name || talentLayerUser?.description?.name || talentLayerUser?.handle;
  const initialHandle = talentLayerUser?.handle || user?.talentLayerHandle;
  const initialValues: ICreateUserFormValues = {
    name: initialName || '',
    talentLayerHandle: initialHandle || '',
    email: user?.email || '',
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(Math.min(initialName?.length || 5, 5))
      .max(20)
      .required('Enter your name'),
    email: Yup.string().required('Enter your email'),
    talentLayerHandle: Yup.string()
      .min(Math.min(initialHandle?.length || 5, 5)) // if user already got a handle with low characters adjust the min length
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
      await refreshData();

      /**
       * @dev Depending on context, we will redirect to the right path. This could be an argument of the function. Globally a callback.
       */
      onSuccess();
    } catch (error: any) {
      // console.log('CATCH error', error);
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
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={true}>
        {({ isSubmitting, setFieldValue, values, isValid, dirty }) => (
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
                  initialValue={initialValues.talentLayerHandle}
                  existingHandle={talentLayerUser?.handle}
                />
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
                      disabled={!(isValid && dirty)}
                      className={`grow px-5 py-2 rounded-xl text-white ${
                        !(isValid && dirty) ? 'bg-gray-500' : 'bg-pink-500'
                      }`}>
                      create my profile
                    </button>
                  ) : (
                    <button
                      className='grow px-5 py-2 rounded-xl bg-black text-white'
                      onClick={e => {
                        openConnectModal();
                        e.preventDefault();
                      }}>
                      connect your wallet
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
