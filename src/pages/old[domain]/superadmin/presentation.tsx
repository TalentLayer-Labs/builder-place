import { Field, Form, Formik } from 'formik';
import { GetServerSidePropsContext } from 'next';
import { useContext } from 'react';
import { usePublicClient } from 'wagmi';
import * as Yup from 'yup';
import SubmitButton from '../../../components/Form/SubmitButton';
import UserNeedsMoreRights from '../../../components/UserNeedsMoreRights';
import { useChainId } from '../../../hooks/useChainId';
import usePlatform from '../../../hooks/usePlatform';
import useTalentLayerClient from '../../../hooks/useTalentLayerClient';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../../../utils/toast';

interface IFormValues {
  about: string;
  website: string;
  video_url: string;
  image_url: string;
}

const validationSchema = Yup.object({
  // nothing required
});

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function AdminPresentation() {
  const { builderPlace, isBuilderPlaceOwner } = useContext(BuilderPlaceContext);
  const platform = usePlatform(builderPlace?.talentLayerPlatformId);
  const platformDescription = platform?.description;
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const talentLayerClient = useTalentLayerClient();

  if (!isBuilderPlaceOwner) {
    return <UserNeedsMoreRights />;
  }

  const initialValues: IFormValues = {
    about: platformDescription?.about || '',
    website: platformDescription?.website || '',
    image_url: platformDescription?.image_url || '',
    video_url: platformDescription?.video_url || '',
  };

  const onSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (!talentLayerClient) {
      throw new Error('talentLayerClient not initialized');
    }

    try {
      const { tx, cid } = await talentLayerClient.platform.update({
        about: values.about,
        website: values.website,
        video_url: values.video_url,
        image_url: values.image_url,
      });

      await createMultiStepsTransactionToast(
        chainId,
        {
          pending: 'Updating platform...',
          success: 'Congrats! Your platform has been updated',
          error: 'An error occurred while updating your platform',
        },
        // @ts-ignore: error after viem v2 migration
        publicClient,
        tx,
        'platform',
        cid,
      );

      setSubmitting(false);
    } catch (error) {
      showErrorTransactionToast(error);
    }
  };

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className=' -mx-6 -mt-6 '>
        <div className='flex py-2 px-6 items-center border-b w-full border-info mb-8'>
          <p className='text-2xl font-bold flex-1 mt-6'>Presentation</p>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={onSubmit}
        validationSchema={validationSchema}>
        {({ isSubmitting, values }) => (
          <Form>
            <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
              <label className='block'>
                <span className='text-base-content'>Website</span>
                <Field
                  type='text'
                  id='website'
                  name='website'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
              </label>

              <label className='block'>
                <span className='text-base-content'>Picture Url</span>
                <Field
                  type='text'
                  id='image_url'
                  name='image_url'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
                <div className='border-info bg-info relative w-full border transition-all duration-300 rounded-xl p-4'>
                  {values.image_url && (
                    <div className='flex items-center justify-center py-3'>
                      <img width='300' height='300' src={values.image_url} alt='image preview' />
                    </div>
                  )}
                </div>
              </label>

              <label className='block'>
                <span className='text-base-content'>About</span>
                <Field
                  as='textarea'
                  id='about'
                  name='about'
                  rows='4'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
              </label>

              <SubmitButton isSubmitting={isSubmitting} label='Update' />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AdminPresentation;
