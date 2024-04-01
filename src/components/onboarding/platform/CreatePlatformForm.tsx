import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import * as Yup from 'yup';
import usePlatformByOwner from '../../../hooks/usePlatformByOwnerAddress';
import UserContext from '../../../modules/BuilderPlace/context/UserContext';
import useCreatePlatform from '../../../modules/BuilderPlace/hooks/platform/useCreatePlatform';
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { IMutation } from '../../../types';
import { showErrorTransactionToast } from '../../../utils/toast';
import SubdomainInput from '../../Form/SubdomainInput';
import Loading from '../../Loading';
import UploadImage from '../../UploadImage';
import AccessDenied from './AccessDenied';
import { PlatformNameInput } from './PlatformNameInput';
import useGetPlatformByOwnerId from '../../../modules/BuilderPlace/hooks/platform/useGetPlatform';
import { useRouter } from 'next/router';

export interface ICreatePlatformFormValues {
  name: string;
  subdomain: string;
  talentLayerPlatformName: string;
  logo: string;
}

export interface ICreatePlatform
  extends IMutation<
    ICreatePlatformFormValues & {
      palette: iBuilderPlacePalette;
      ownerId: number;
      talentLayerPlatformId: string;
    }
  > {}

/**
 * @dev
 *
 * Logicall flow:
 *
 * IF user has a wallet connected
 *      IF user has profile in DB with this wallet and the account is validated
 *          Let the user complete the form
 *      ELSE
 *          Access denied
 *  ELSE
 *      Access denied
 */
function CreatePlatformForm({ onSuccess }: { onSuccess: (subdomain: string) => void }) {
  const { loading: isLoadingUser, user, address } = useContext(UserContext);
  const { open: openConnectModal } = useWeb3Modal();
  const existingTalentLayerPlatform = usePlatformByOwner(address);
  const { createNewPlatform } = useCreatePlatform();
  const router = useRouter();
  const { platform: existingDatabasePlatform } = useGetPlatformByOwnerId(user?.id);
  const alreadyOwnsAPlatform = existingDatabasePlatform?.ownerId === user?.id;

  const initialValues: ICreatePlatformFormValues = {
    name: '',
    subdomain: '',
    talentLayerPlatformName: existingTalentLayerPlatform?.name || '',
    logo: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().min(5).max(20).required('Enter your company name'),
    subdomain: Yup.string()
      .min(3)
      .max(20)
      .matches(/^[a-z0-9][a-z0-9-]*$/, 'Only a-z, 0-9 and - allowed, and cannot begin with -')
      .required('subdomain is required'),
    talentLayerPlatformName: Yup.string()
      .min(5)
      .max(20)
      .matches(/^[a-z0-9][a-z0-9-_]*$/, 'Only a-z, 0-9 and -_ allowed, and cannot begin with -_')
      .required('Enter your platform name'),
  });

  const handleSubmit = async (
    values: ICreatePlatformFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      setSubmitting(true);

      if (!user) {
        throw new Error('Please connect first');
      }

      await createNewPlatform(values, user, existingTalentLayerPlatform);
      //TODO add get like user ?

      /**
       * @dev Depending on context, we will redirect to the right path. This could be an argument of the function. Globally a callback.
       */
      onSuccess(values.subdomain);
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

  if (!user) {
    return <AccessDenied />;
  }

  if (alreadyOwnsAPlatform) {
    const domain = existingDatabasePlatform?.customDomain || existingDatabasePlatform?.subdomain;

    const onRedirect = async () => {
      console.log('DEBUG', `${window.location.protocol}//${domain}`);
      await router.push(`${window.location.protocol}//${domain}`);
    };

    return (
      <div className='flex flex-col items-center justify-center text-base-content text-primary'>
        <div className='rounded-lg pb-5 max-w-md text-center'>
          <p className='text-lg mb-4'>
            You already own <strong>{domain}</strong>
          </p>
          {existingDatabasePlatform?.logo && (
            <div className='mb-4'>
              <img
                src={existingDatabasePlatform?.logo}
                alt='Platform Logo'
                className='mx-auto h-20 w-20 object-cover rounded-full border-2'
              />
            </div>
          )}
          <button
            className='rounded-md bg-info px-3.5 py-2.5 text-sm font-semibold text-base-content shadow-sm hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
            onClick={onRedirect}>
            Go to My Domain
          </button>
        </div>
      </div>
    );
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
                  placeholder='company name'
                />
                <span className='text-red-500'>
                  <ErrorMessage name='name' />
                </span>
              </label>

              <SubdomainInput />

              <label className='block'>
                <span className='font-bold text-md'>talentLayerPlatformName*</span>
                <PlatformNameInput
                  initialValue={initialValues.name}
                  existingPlatformName={existingTalentLayerPlatform?.name}
                />
              </label>

              <UploadImage
                fieldName='logo'
                label='logo'
                legend='rectangle format, used in top of your place'
                src={values.logo}
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
                      create my platform
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
    </div>
  );
}

export default CreatePlatformForm;
