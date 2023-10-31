import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useChainId, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import DefaultPalettes from '../../../components/DefaultPalettes';
import HirerProfileLayout from '../../../components/HirerProfileLayout';
import Loading from '../../../components/Loading';
import TalentLayerContext from '../../../context/talentLayer';
import { useGetBuilderPlaceFromOwner } from '../../../modules/BuilderPlace/hooks/UseGetBuilderPlaceFromOwner';
import { useUpdateBuilderPlace } from '../../../modules/BuilderPlace/hooks/UseUpdateBuilderPlace';
import { uploadImage } from '../../../modules/BuilderPlace/utils';
import { themes } from '../../../utils/themes';
interface IFormValues {
  subdomain: string;
  palette: keyof typeof themes;
  logo?: string;
}

const validationSchema = Yup.object({
  subdomain: Yup.string().required('subdomain is required'),
});
function onboardingStep3() {
  const { account, user, loading } = useContext(TalentLayerContext);
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { data: updateBuilderPlace, mutateAsync: updateBuilderPlaceAsync } =
    useUpdateBuilderPlace();
  const builderPlaceData = useGetBuilderPlaceFromOwner(user?.id as string);
  const router = useRouter();
  const [logoLoader, setLogoLoader] = useState(false);
  const [logoErrorMessage, setLogoErrorMessage] = useState('');

  const initialValues: IFormValues = {
    subdomain: builderPlaceData?.subdomain || '',
    logo: builderPlaceData?.logo || '',
    palette: 'light',
  };

  if (loading) {
    console.log('no data');
    return (
      <div className='flex flex-col mt-5 pb-8'>
        <Loading />
      </div>
    );
  }

  if (!builderPlaceData) {
    return (
      <div className='flex flex-col mt-5 pb-8'>
        <p>No builderPlace found in link to this wallet</p>
      </div>
    );
  }

  const handleSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (walletClient && account?.address) {
      setSubmitting(true);
      try {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: account.address,
          message: values.subdomain,
        });

        await updateBuilderPlaceAsync({
          subdomain: values.subdomain,
          logo: values.logo,
          name: builderPlaceData.name,
          ownerTalentLayerId: builderPlaceData.ownerTalentLayerId,
          palette: themes[values.palette],
          owners: builderPlaceData.owners,
          status: 'validated',
          signature,
        });
        router.push(`${window.location.protocol}//${values.subdomain}/dashboard`);
      } catch (e: any) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <HirerProfileLayout step={3}>
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}>
          {({ isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className='grid grid-cols-1 gap-6'>
                <label className='block'>
                  <span className='text-stone-800 font-bold text-md'>custom domain</span>
                  <Field
                    type='text'
                    id='subdomain'
                    name='subdomain'
                    className='mt-1 mb-1 block w-full rounded-xl border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                    placeholder={`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                  />
                </label>
                <span className='text-red-500'>
                  <ErrorMessage name='subdomain' />
                </span>

                <label className='block'>
                  <span className='text-stone-800 font-bold text-md'>logo</span>
                  <input
                    type='file'
                    id='logo'
                    name='logo'
                    onChange={async (event: any) => {
                      await uploadImage(
                        event.currentTarget.files[0],
                        setFieldValue,
                        setLogoErrorMessage,
                        'logo',
                        setLogoLoader,
                        user?.handle,
                      );
                    }}
                    className='mt-1 mb-1 block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:ring-opacity-50'
                    placeholder=''
                  />
                  {logoLoader && <Loading />}
                  {!!values.logo && (
                    <div className='flex items-center justify-center py-3'>
                      <img width='300' height='300' src={values.logo} alt='' />
                    </div>
                  )}
                </label>
                <span className='text-red-500'>
                  <p>{logoErrorMessage}</p>
                </span>

                <DefaultPalettes
                  onChange={palette => {
                    setFieldValue('palette', palette);
                  }}
                />

                {isSubmitting ? (
                  <button
                    disabled
                    type='submit'
                    className='grow px-5 py-2 rounded-xl bg-pink-300 text-white'>
                    Loading...
                  </button>
                ) : (
                  <button
                    type='submit'
                    className='grow px-5 py-2 rounded-xl bg-pink-500 text-white'>
                    Sign and validate
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </HirerProfileLayout>
    </>
  );
}

export default onboardingStep3;
