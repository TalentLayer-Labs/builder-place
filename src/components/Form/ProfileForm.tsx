'use client';

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

export interface IUpdateProfileFormValues {
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

  const initialValues: IUpdateProfileFormValues = {
    title: userDescription?.title || '',
    role: userDescription?.role || '',
    image_url: userDescription?.image_url || user?.picture || '',
    video_url: userDescription?.video_url || '',
    name: userDescription?.name || user?.name || '',
    about: userDescription?.about || '',
    skills: userDescription?.skills_raw || '',
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
