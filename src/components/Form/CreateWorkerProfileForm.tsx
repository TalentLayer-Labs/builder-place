import { useWeb3Modal } from '@web3modal/react';
import { Field, Form, Formik } from 'formik';
import { QuestionMarkCircle } from 'heroicons-react';
import { useContext, useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import { useChainId } from '../../hooks/useChainId';
import useUserById from '../../hooks/useUserById';
import Web3MailContext from '../../modules/Web3mail/context/web3mail';
import { createWeb3mailToast } from '../../modules/Web3mail/utils/toast';
import { generatePicture } from '../../utils/ai-picture-gen';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../../utils/toast';
import Loading from '../Loading';
import { delegateUpdateProfileData } from '../request';
import SubmitButton from './SubmitButton';
import { SkillsInput } from './skills-input';
import useTalentLayerClient from '../../hooks/useTalentLayerClient';
import { useRouter } from 'next/router';

interface IFormValues {
  title?: string;
  role?: string;
  image_url?: string;
  video_url?: string;
  name?: string;
  about?: string;
  skills?: string;
}

const validationSchema = Yup.object({
  title: Yup.string().required('title is required'),
});

function CreateWorkerProfileForm({ callback }: { callback?: () => void }) {
  const chainId = useChainId();
  const { open: openConnectModal } = useWeb3Modal();
  const { user, isActiveDelegate, refreshData } = useContext(TalentLayerContext);
  const { platformHasAccess } = useContext(Web3MailContext);
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const [aiLoading, setAiLoading] = useState(false);
  const userDescription = user?.id ? useUserById(user?.id)?.description : null;
  const talentLayerClient = useTalentLayerClient();
  const router = useRouter();
  const serviceId = new URL(window.location.href).searchParams.get('serviceId');

  if (!user?.id) {
    return <Loading />;
  }

  const initialValues: IFormValues = {
    title: userDescription?.title || '',
    role: userDescription?.role || '',
    image_url: userDescription?.image_url || '',
    video_url: userDescription?.video_url || '',
    name: userDescription?.name || '',
    about: userDescription?.about || '',
    skills: userDescription?.skills_raw || '',
  };

  const generatePictureUrl = async (e: React.FormEvent, callback: (string: string) => void) => {
    e.preventDefault();
    setAiLoading(true);
    const image_url = await generatePicture();
    if (image_url) {
      callback(image_url);
    }
    setAiLoading(false);
  };

  const onSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (user && walletClient && publicClient && talentLayerClient) {
      try {
        const profile = {
          title: values.title,
          role: values.role,
          image_url: values.image_url,
          video_url: values.video_url,
          name: values.name,
          about: values.about,
          skills: values.skills,
          web3mailPreferences: user.description?.web3mailPreferences,
        };

        let cid = await talentLayerClient.profile.upload(profile);

        let tx;
        if (isActiveDelegate) {
          const response = await delegateUpdateProfileData(chainId, user.id, user.address, cid);
          tx = response.data.transaction;
        } else {
          const res = await talentLayerClient?.profile.update(profile, user.id);

          tx = res.tx;
          cid = res.cid;
        }

        await createMultiStepsTransactionToast(
          chainId,
          {
            pending: 'Creating Worker Profile..',
            success: 'Congrats! Your profile has been created',
            error: 'An error occurred while creating your profile',
          },
          publicClient,
          tx,
          'user',
          cid,
        );

        if (callback) {
          callback();
        }

        refreshData();
        setSubmitting(false);
        if (process.env.NEXT_PUBLIC_ACTIVE_WEB3MAIL == 'true' && !platformHasAccess) {
          createWeb3mailToast();
        }

        router.push(`/worker-onboarding/step3?serviceId=${serviceId}`);
      } catch (error) {
        console.log(error);
        showErrorTransactionToast(error);
      }
    } else {
      openConnectModal();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({ isSubmitting, setFieldValue, values }) => (
        <Form>
          <div className='grid grid-cols-1 gap-6'>
            <label className='block'>
              <span className='text-xl font-bold '>title</span>
              <Field
                type='text'
                id='title'
                name='title'
                className='mt-1 mb-1 block w-full rounded-xl border border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
            </label>
            <label className='block'>
              <span className='text-xl font-bold '>name</span>
              <Field
                type='text'
                id='name'
                name='name'
                className='mt-1 mb-1 block w-full rounded-xl border border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
            </label>
            <label className='block'>
              <span className='text-xl font-bold '>role</span>
              <Field
                as='input'
                type='text'
                id='role'
                name='role'
                value='worker'
                className='mt-1 mb-1 block w-full rounded-xl border border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                readOnly
              />
            </label>

            <label className='block'>
              <span className='text-xl font-bold '>picture url</span>
              <Field
                type='text'
                id='image_url'
                name='image_url'
                className='mt-1 mb-1 block w-full rounded-xl border border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
            </label>

            <label className='block'>
              <span className='text-xl font-bold '>about</span>
              <Field
                as='textarea'
                id='about'
                name='about'
                rows='4'
                className='mt-1 mb-1 block w-full rounded-xl border border-2 border-gray-200 bg-midnight shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
            </label>

            <label className='block'>
              <span className='text-xl font-bold '>skills</span>

              <SkillsInput initialValues={userDescription?.skills_raw} entityId={'skills'} />

              <Field type='hidden' id='skills' name='skills' />
            </label>
            <SubmitButton isSubmitting={isSubmitting} label='create profile' />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default CreateWorkerProfileForm;
