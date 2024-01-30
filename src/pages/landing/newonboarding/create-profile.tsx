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
import axios from 'axios';

interface IFormValues {
  name: string;
  email: string;
  picture?: string;
}

interface IMutationValues {
  email: string;
  name: string;
  address: string;
  picture?: string;
  signature: `0x${string}` | Uint8Array;
}

/**
 * @SPECS
 *  IF user has a wallet connected
 *      IF user has a TalentLayerID
 *          IF user has profile in DB with this TalentLayerID
 *             redirect to step 2
 *          ELSE
 *              Let the user complete the form, we will create a profile in DB (link to the existing TalentLayerID)
 *      ELSE
 *         Let the user complete the form, we will create a a TalentLayerID and a profile in DB
 *  ELSE
 *     let the user complete the form and ask him to conenct on submit
 *
 *
 * @TODO
 * Already got a profile ? just connect
 * useState => check if user is connect and if he has a profile, if yes move to step 2
 *
 * Display the generated handle under name (slugify version of the name)
 */
function createProfile() {
  const { loading, user } = useContext(UserContext);
  const { open: openConnectModal } = useWeb3Modal();
  const router = useRouter();
  const userMutation = useMutation({
    mutationFn: (user: IMutationValues) => {
      return axios.post('/api/users', user);
    },
    onMutate: variables => {
      // A mutation is about to happen!
      console.log(`*DEBUG* start mutate!`);
      // Optionally return a context containing data to use when for example rolling back
      return { id: 1 };
    },
    onError: (error, variables, context) => {
      // An error happened!
      console.log(`*DEBUG* rolling back optimistic update with id ${context?.id}`);
    },
    onSuccess: (data, variables, context) => {
      console.log(`*DEBUG* boom baby!`);
    },
  });

  const initialValues: IFormValues = {
    name: '',
    email: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(2).max(20).required('Enter your name'),
    email: Yup.string().required('Please provide your email'),
  });

  console.log('*DEBUG* createProfile', { user });

  useEffect(() => {
    if (user) {
      router.push('/newonboarding/create-platform');
    }
  }, [user]);

  const handleSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      setSubmitting(true);
      const userResponse = await userMutation.mutate({
        email: values.email,
        name: values.name,
        picture: values.picture || undefined,
        address: '',
        signature: '0xtreter',
      });

      console.log('*DEBUG* userMutation.mutate', { userResponse });

      // const userId = userResponse.id;

      // if (userResponse.error) {
      //   throw new Error(userResponse.error);
      // }

      // router.query.userId = userId;
      // router.push({
      //   pathname: '/newonboarding/create-platform',
      //   query: { userId: userId },
      // });
    } catch (error: any) {
      showErrorTransactionToast(error.message);
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout step={1}>
      <p className=' pb-5 sm:pb-10 pt-5 text-3xl sm:text-5xl font-bold mt-6 text-center'>
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
                  <button
                    type='submit'
                    className='grow px-5 py-2 rounded-xl bg-pink-500 text-white'>
                    create my profile
                  </button>
                </>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <p className='mt-4'>
        Already got a profile ?{' '}
        <button
          onClick={() => {
            openConnectModal();
          }}>
          <a className='text-pink-500'>connect now</a>
        </button>
      </p>
    </Layout>
  );
}

export default createProfile;
