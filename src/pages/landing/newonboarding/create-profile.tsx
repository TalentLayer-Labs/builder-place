import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import UploadImage from '../../../components/UploadImage';
import Layout from '../../../components/onboarding/Layout';
import { showErrorTransactionToast } from '../../../utils/toast';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';
import { useContext, useEffect } from 'react';
import Loading from '../../../components/Loading';
import { useMutation } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { sendVerificationEmail } from '../../../modules/BuilderPlace/request';
import { createVerificationEmailToast } from '../../../modules/BuilderPlace/utils/toast';

interface IFormValues {
  email: string;
  name: string;
  picture?: string;
}

/**
 * @dev We want to normalize all database mutations
 * A mutation must required:
 *  - data: the data to mutate with a dynamic type
 *  - signature: the signature of the data by the current wallet. The only for us to confirm the ownership of the address
 *  - domain: the domain of the BP used which could be the default one, or any BuilderPlaces
 */
interface IMutation<T> {
  data: T;
  signature: `0x${string}` | Uint8Array;
  domain: string;
}

export interface IPostUser
  extends IMutation<
    IFormValues & {
      address: string;
    }
  > {}

/**
 * @dev This form aims to be used for all profile onboarding (worker, builder space owner, collaborator).
 *  The differences beetween context are:
 *    - the redirection on success
 *    - the automatic redirection in case of existing profile
 *
 * @dev Logicall flow:
 *  IF user has a wallet connected
 *      REQUEST: We try to get from DB his user profile
 *
 *      IF user has profile in DB with this wallet
 *         redirect to step 2
 *      ELSE
 *          Let the user complete the form, we will create a profile in DB (and a TalentLayerID if the wallet don't have one yet)
 *  ELSE
 *     let the user complete the form and ask him to conenct on submit
 *
 * @TODO
 * Display the generated handle under name (slugify version of the name)
 */
function createProfile() {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { loading: isLoadingUser, user, address } = useContext(UserContext);
  const { open: openConnectModal } = useWeb3Modal();
  const router = useRouter();
  const userMutation = useMutation(
    async (body: IPostUser): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.post('/api/users', body);
    },
  );

  const initialValues: IFormValues = {
    name: '',
    email: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(2).max(20).required('Enter your name'),
    email: Yup.string().required('Enter your email'),
  });

  console.log('*DEBUG* createProfile', { user, address, walletClient });

  useEffect(() => {
    if (user) {
      console.log('*DEBUG* REDIRECT');
      // router.push('/newonboarding/create-platform');
    }
  }, [user]);

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
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      /**
       * @dev Post a new user to DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      const response = await userMutation.mutateAsync({
        data: {
          email: values.email,
          name: values.name,
          picture: values.picture || undefined,
          address: address,
        },
        signature: signature,
        domain: window.location.hostname + ':' + window.location.port,
      });

      console.log('*DEBUG* userMutation.mutate', { response });

      await createVerificationEmailToast();

      router.push({
        pathname: '/newonboarding/create-platform',
      });
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
    <Layout step={1}>
      <p className=' pb-5 sm:pb-10 pt-5 text-3xl sm:text-5xl font-bold mt-3 sm:mt-6 text-center'>
        Create your profile
      </p>

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
    </Layout>
  );
}

export default createProfile;
