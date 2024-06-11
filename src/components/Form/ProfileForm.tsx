import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import useUserById from '../../hooks/useUserById';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import useUpdateUser from '../../modules/BuilderPlace/hooks/user/useUpdateUser';
import { showErrorTransactionToast } from '../../utils/toast';
import Loading from '../Loading';
import SubmitButton from './SubmitButton';
import { SkillsInput } from './skills-input';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createVerificationEmailToast } from '../../modules/BuilderPlace/utils/toast';

export interface IUpdateProfileFormValues {
  title?: string;
  role?: string;
  image_url?: string;
  video_url?: string;
  name?: string;
  about?: string;
  skills?: string;
  email?: string;
}

const validationSchema = Yup.object({
  title: Yup.string().required('title is required'),
});

function ProfileForm({ callback }: { callback?: () => void }) {
  const { user } = useContext(UserContext);
  const { user: talentLayerUser, refreshData } = useContext(TalentLayerContext);
  const userDescription = talentLayerUser?.id
    ? useUserById(talentLayerUser?.id)?.description
    : null;
  const { updateUser } = useUpdateUser();

  if (!talentLayerUser?.id) {
    return <Loading />;
  }

  const initialSkills = user?.workerProfile?.skills.toString() || userDescription?.skills_raw || '';

  const initialValues: IUpdateProfileFormValues = {
    title: user?.title || userDescription?.title || '',
    role: user?.role || userDescription?.role || '',
    image_url: user?.picture || userDescription?.image_url || user?.picture || '',
    video_url: user?.video || userDescription?.video_url || '',
    name: user?.name || userDescription?.name || user?.name || '',
    about: user?.about || userDescription?.about || '',
    skills: initialSkills,
    email: user?.email || '',
  };

  const onSubmit = async (
    values: IUpdateProfileFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      await updateUser(values);

      if (callback) {
        callback();
      }

      if (initialValues.email !== values.email) {
        await createVerificationEmailToast();
      }

      refreshData();
      setSubmitting(false);
    } catch (error) {
      showErrorTransactionToast(error);
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
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
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
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
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
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
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
              <span className='text-base-content'>email</span>
              <div className='flex items-center'>
                <Field
                  type='email'
                  id='email'
                  name='email'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''></Field>
              </div>
              {user?.isEmailVerified ? (
                <div className={'flex flex-row items-center'}>
                  <CheckIcon
                    width={25}
                    height={25}
                    className='bg-base-100 bg-success p-1 mx-2 border border-success-100 rounded-full'
                  />
                  <span className='text-sm text-base-content opacity-50'>Email verified</span>
                </div>
              ) : (
                <div className={'flex flex-row items-center'}>
                  <XMarkIcon
                    width={20}
                    height={20}
                    className='bg-base-100 bg-error p-1 mx-2 border border-error-200 rounded-full'
                  />
                  <p className='text-sm text-base-content opacity-50'>Email not verified</p>
                </div>
              )}
              <span className='text-alone-error'>
                <ErrorMessage name='email' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>picture url</span>
              <Field
                type='text'
                id='image_url'
                name='image_url'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              {values.image_url && (
                <div className='border-2 border-info bg-base-200 relative w-full transition-all duration-300 rounded-xl p-4'>
                  <div className='flex items-center justify-center py-3'>
                    <img width='300' height='300' src={values.image_url} alt='' />
                  </div>
                </div>
              )}
              <span className='text-alone-error'>
                <ErrorMessage name='image_url' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>video presentation url</span>
              <Field
                type='text'
                id='video_url'
                name='video_url'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              {values.video_url && (
                <div className='border-2 border-info bg-base-200 relative w-full transition-all duration-300 rounded-xl p-4'>
                  <div className='flex items-center justify-center py-3'>
                    <video>
                      <source width='300' src={values.video_url} type='video/webm' />
                      <source src={values.video_url} type='video/mp4' />
                      Sorry, your browser doesn't support videos.
                    </video>
                    <iframe src={values.video_url} width='300' height='auto' allowFullScreen />
                  </div>
                </div>
              )}
              <span className='text-alone-error'>
                <ErrorMessage name='video_url' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>about</span>
              <Field
                as='textarea'
                id='about'
                name='about'
                rows='4'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='about' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>skills</span>

              <SkillsInput initialValues={initialSkills} entityId={'skills'} />

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
