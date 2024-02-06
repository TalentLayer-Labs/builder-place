import { useWeb3Modal } from '@web3modal/wagmi/react';
import axios, { AxiosResponse } from 'axios';
import { ErrorMessage, Field, Form, Formik, useFormikContext } from 'formik';
import { useContext, useEffect } from 'react';
import { useMutation } from 'react-query';
import { useChainId, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import useMintFee from '../../hooks/useMintFee';
import useTalentLayerClient from '../../hooks/useTalentLayerClient';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import { createVerificationEmailToast } from '../../modules/BuilderPlace/utils/toast';
import { IMutation } from '../../types';
import { showErrorTransactionToast } from '../../utils/toast';
import UploadImage from '../UploadImage';
import { delegateMintID } from '../request';
import Loading from '../Loading';
import { slugify } from '../../modules/BuilderPlace/utils';
import { HandleInput } from './HandleInput';
import TalentLayerContext from '../../context/talentLayer';

interface IFormValues {
  name: string;
  talentLayerHandle: string;
  email: string;
  picture?: string;
}

export interface ICreateUser
  extends IMutation<
    IFormValues & {
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
 *      IF user has profile in DB with this wallet
 *         execute success callback
 *      ELSE
 *          Let the user complete the form, we will create a profile in DB (and a TalentLayerID if the wallet don't have one yet)
 *  ELSE
 *     let the user complete the form and ask him to conenct on submit
 */
function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { loading: isLoadingUser, user, address } = useContext(UserContext);
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const { open: openConnectModal } = useWeb3Modal();
  const { calculateMintFee } = useMintFee();
  const talentLayerClient = useTalentLayerClient();
  const userMutation = useMutation(
    async (body: ICreateUser): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.post('/api/users', body);
    },
  );

  useEffect(() => {
    if (user) {
      onSuccess();
    }
  }, [user]);

  const initialValues: IFormValues = {
    name: talentLayerUser?.description?.name || talentLayerUser?.handle || '',
    talentLayerHandle: talentLayerUser?.handle || '',
    email: '',
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

  console.log('*DEBUG* CreateUserForm render', { user, address, walletClient });

  const handleSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      setSubmitting(true);

      console.log('*DEBUG* handleSubmit', { user, address, walletClient });

      if (!walletClient || !address) {
        throw new Error('Please connect your wallet');
      }

      /**
       * @dev Create a multistep toast to inform the user about the process
       */

      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      /**
       * @dev Now we can mint the TalentLayerID. Better to do a new query here to make it not blocking potentially.
       * @note: it would block the process if we have to wait for tx confirmation to get the new TLID, so we continue the process.
       */
      if (!talentLayerUser) {
        if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_MINT === 'true') {
          const handlePrice = calculateMintFee(values.talentLayerHandle);
          const response2 = await delegateMintID(
            chainId,
            values.talentLayerHandle,
            String(handlePrice),
            address,
            signature,
            process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_ON_MINT === 'true' ? true : false,
          );
          console.log('*DEBUG* delegateMintID', { response2 });
        } else {
          if (talentLayerClient) {
            const tx = await talentLayerClient.profile.create(values.talentLayerHandle);
            console.log('*DEBUG* mint', { tx });
          }
        }
      }

      /**
       * @dev Post a new user to DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      const response = await userMutation.mutateAsync({
        data: {
          name: values.name,
          talentLayerHandle: values.talentLayerHandle,
          email: values.email,
          picture: values.picture || undefined,
          address: address,
        },
        signature: signature,
        domain: window.location.hostname + ':' + window.location.port,
      });

      console.log('*DEBUG* userMutation.mutate', { response });

      /**
       * @dev Success, we can redirect to the next step and alter the user for Email and Minting
       */
      await createVerificationEmailToast();

      /**
       * @dev Depending on context, we will redirect to the right path. This could be an argument of the function. Globally a callback.
       */
      onSuccess();
    } catch (error: any) {
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
                <HandleInput />
                <span className='text-red-500'>
                  <ErrorMessage name='handle' />
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
