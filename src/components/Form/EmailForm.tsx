import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { verifyEmail } from '../../modules/BuilderPlace/request';
import SubmitButton from './SubmitButton';

interface IFormValues {
  email: string;
}

const validationSchema = Yup.object({
  email: Yup.string().required('Please provide an email'),
});

function EmailForm({ callback }: { callback?: () => void }) {
  const initialValues: IFormValues = {
    email: '',
  };
  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    setSubmitting(true);
    const response = await verifyEmail(values.email);
    console.log('response', response);
    setSubmitting(false);
    resetForm();
    if (callback) {
      callback();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={onSubmit}
      validationSchema={validationSchema}>
      {({ isSubmitting, errors }) => (
        <Form>
          <div className='border border-info rounded-xl p-6 bg-base-100'>
            <label className='block'>
              <span className='text-base-content'>Email: </span>
              <Field
                type='text'
                id='email'
                name='email'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder='Write your email here'
              />
              <span className='text-alone-error'>
                <ErrorMessage name='email' />
              </span>
            </label>
            <SubmitButton isSubmitting={isSubmitting} label='Add your email' />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default EmailForm;
