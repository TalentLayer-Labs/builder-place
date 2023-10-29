import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { useChainId, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../../context/talentLayer';
import { useGetBuilderPlaceFromOwner } from '../../../modules/BuilderPlace/hooks/UseGetBuilderPlaceFromOwner';
import { useUpdateBuilderPlace } from '../../../modules/BuilderPlace/hooks/UseUpdateBuilderPlace';
import { upload } from '../../../modules/BuilderPlace/request';
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { themes } from '../../../utils/themes';

interface IFormValues {
  subdomain: string;
  palette: keyof typeof themes;
  logo?: File;
  cover?: File;
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

  const initialValues: IFormValues = {
    subdomain: builderPlaceData?.subdomain || '',
    palette: 'light',
  };

  const handleSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (walletClient && account?.address) {
      try {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: account.address,
          message: values.subdomain,
        });

        let logo;
        if (values.logo) {
          logo = await upload(values.logo);
          console.log({ logo, url: logo?.variants[0] });
        }

        let cover;
        if (values.cover) {
          cover = await upload(values.cover);
          console.log({ cover, url: cover?.variants[0] });
        }

        if (builderPlaceData) {
          await updateBuilderPlaceAsync({
            subdomain: values.subdomain,
            logo: logo?.variants[0] || null,
            cover: cover?.variants[0] || null,
            name: builderPlaceData.name,
            ownerTalentLayerId: builderPlaceData.ownerTalentLayerId,
            palette: themes[values.palette],
            owners: builderPlaceData.owners,
            status: builderPlaceData.status,
            signature,
          });

          setSubmitting(false);
          router.push(`${window.location.protocol}//${values.subdomain}/dashboard`);
        }
      } catch (e: any) {
        console.error(e);
      }
    }
  };
  return (
    <>
      <p>Hirer onboarding - step3</p>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}>
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className='grid grid-cols-1 gap-6'>
              <label className='block'>
                <span className='text-stone-800'>Subdomain</span>
                <Field
                  type='text'
                  id='subdomain'
                  name='subdomain'
                  className='mt-1 mb-1 block w-full rounded-xl border border-redpraha bg-midnight shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
              </label>
              <span className='text-red-500'>
                <ErrorMessage name='subdomain' />
              </span>

              <label className='block'>
                <span className='text-stone-800'>Logo</span>
                <input
                  type='file'
                  id='logo'
                  name='logo'
                  onChange={(event: any) => {
                    setFieldValue('logo', event.currentTarget.files[0]);
                  }}
                  className='mt-1 mb-1 block w-full rounded-xl border border-redpraha bg-midnight shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
              </label>
              <span className='text-red-500'>
                <ErrorMessage name='logo' />
              </span>
              <label className='block'>
                <span className='text-stone-800'>Cover</span>
                <input
                  type='file'
                  id='cover'
                  name='cover'
                  onChange={(event: any) => {
                    setFieldValue('cover', event.currentTarget.files[0]);
                  }}
                  className='mt-1 mb-1 block w-full rounded-xl border border-redpraha bg-midnight shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
              </label>
              <span className='text-red-500'>
                <ErrorMessage name='cover' />
              </span>

              <label className='block'>
                <span className='text-stone-800'>Choose a Color Palette</span>

                <div className='flex flex-col gap-2'>
                  {Object.keys(themes).map((value, index) => {
                    return (
                      <div>
                        <input
                          type='radio'
                          className='hidden peer'
                          name='num'
                          id={`radio${index}`}
                          key={value}
                          onChange={() => {
                            setFieldValue('palette', value);
                          }}
                        />
                        <label>{value} Palette</label>
                        <label
                          htmlFor={`radio${index}`}
                          className='h-24 peer-checked:border-blue-500 border-2 border-solid rounded-lg flex items-center px-1 gap-2 w-fit'>
                          {Object.keys(themes[value as keyof typeof themes]).map(color => {
                            return (
                              <div
                                className='w-20 h-20 border'
                                style={{
                                  backgroundColor:
                                    themes[value as keyof typeof themes][
                                      color as keyof iBuilderPlacePalette
                                    ],
                                }}
                              />
                            );
                          })}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </label>
              <button
                type='submit'
                className='grow px-5 py-2 rounded-xl bg-redpraha text-stone-800'>
                I'm done
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default onboardingStep3;
