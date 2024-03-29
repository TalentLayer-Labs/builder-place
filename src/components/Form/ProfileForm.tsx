import { useWeb3Modal } from '@web3modal/wagmi/react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { QuestionMarkCircle } from 'heroicons-react';
import { useContext, useState } from 'react';
import { useAccount } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import useUserById from '../../hooks/useUserById';
import Web3MailContext from '../../modules/Web3mail/context/web3mail';
import { createWeb3mailToast } from '../../modules/Web3mail/utils/toast';
import { generatePicture } from '../../utils/ai-picture-gen';
import { showErrorTransactionToast } from '../../utils/toast';
import Loading from '../Loading';
import SubmitButton from './SubmitButton';
import { SkillsInput } from './skills-input';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import { IMutation } from '../../types';
import useUpdateUser from '../../modules/BuilderPlace/hooks/user/useUpdateUser';

export interface IUpdateProfileFormValues {
  title?: string;
  role?: string;
  image_url?: string;
  video_url?: string;
  name?: string;
  about?: string;
  skills?: string;
}

export interface IUpdateProfile extends IMutation<IUpdateProfileFormValues> {}

const validationSchema = Yup.object({
  title: Yup.string().required('title is required'),
});

function ProfileForm({ callback }: { callback?: () => void }) {
  const { open: openConnectModal } = useWeb3Modal();
  const { user } = useContext(UserContext);
  const account = useAccount();
  const { user: talentLayerUser, refreshData } = useContext(TalentLayerContext);
  const { platformHasAccess } = useContext(Web3MailContext);
  const [aiLoading, setAiLoading] = useState(false);
  const userDescription = talentLayerUser?.id
    ? useUserById(talentLayerUser?.id)?.description
    : null;
  const { updateUser } = useUpdateUser();

  if (!talentLayerUser?.id) {
    return <Loading />;
  }

  const initialValues: IUpdateProfileFormValues = {
    title: userDescription?.title || '',
    role: userDescription?.role || '',
    image_url: userDescription?.image_url || user?.picture || '',
    video_url: userDescription?.video_url || '',
    name: userDescription?.name || user?.name || '',
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
    values: IUpdateProfileFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (account?.isConnected === true) {
      try {
        await updateUser(values);

        if (callback) {
          callback();
        }

        refreshData();
        setSubmitting(false);
        if (process.env.NEXT_PUBLIC_EMAIL_MODE == 'web3' && !platformHasAccess) {
          createWeb3mailToast();
        }
      } catch (error) {
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
              <span className='text-base-content'>title</span>
              <Field
                type='text'
                id='title'
                name='title'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='title' />
              </span>
            </label>
            <label className='block'>
              <span className='text-base-content'>name</span>
              <Field
                type='text'
                id='name'
                name='name'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='name' />
              </span>
            </label>
            <label className='block'>
              <span className='text-base-content'>role</span>
              <Field
                as='select'
                id='role'
                name='role'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''>
                <option value=''></option>
                <option value='buyer'>freelancer</option>
                <option value='seller'>hirer</option>
                <option value='buyer-seller'>both</option>
              </Field>
              <span className='text-alone-error'>
                <ErrorMessage name='role' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>picture url</span>
              <Field
                type='text'
                id='image_url'
                name='image_url'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <div className='border border-info bg-base-200 relative w-full border transition-all duration-300 rounded-xl p-4'>
                <div className='flex w-full items-center gap-3'>
                  <QuestionMarkCircle className='hidden' />
                  <div>
                    <h2 className='font-heading text-xs font-bold text-xl font-bold  mb-1'>
                      <span>Need help?</span>
                    </h2>
                    <p className='font-alt text-xs font-normal'>
                      <span className='text-base-content'>Use our AI to generate a cool one</span>
                    </p>
                  </div>
                  <div className='ms-auto'>
                    <button
                      disabled={aiLoading}
                      onClick={e =>
                        generatePictureUrl(e, newUrl => setFieldValue('image_url', newUrl))
                      }
                      className='border text-base-content bg-base-300 hover:bg-base-100 border-white rounded-md h-10 w-10 p-2 relative inline-flex items-center justify-center space-x-1 font-sans text-sm font-normal leading-5 no-underline outline-none transition-all duration-300'>
                      {aiLoading ? <Loading /> : 'GO'}
                    </button>
                  </div>
                </div>
                {values.image_url && (
                  <div className='flex items-center justify-center py-3'>
                    <img width='300' height='300' src={values.image_url} alt='' />
                  </div>
                )}
              </div>
              <span className='text-alone-error'>
                <ErrorMessage name='image_url' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>about</span>
              <Field
                as='textarea'
                id='about'
                name='about'
                rows='4'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='about' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>skills</span>

              <SkillsInput initialValues={userDescription?.skills_raw} entityId={'skills'} />

              <Field type='hidden' id='skills' name='skills' />
              <span className='text-alone-error'>
                <ErrorMessage name='skills' />
              </span>
            </label>

            <SubmitButton isSubmitting={isSubmitting} label='Update' />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ProfileForm;
