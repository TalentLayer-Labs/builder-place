import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import useRecordReview from '../../modules/BuilderPlace/hooks/review/useRecordReview';
import { showErrorTransactionToast } from '../../utils/toast';
import SubmitButton from './SubmitButton';

export interface IFormValues {
  content: string;
  rating: number;
}

const validationSchema = Yup.object({
  content: Yup.string().required('Please provide a content'),
  rating: Yup.string().required('rating is required'),
});

const initialValues: IFormValues = {
  content: '',
  rating: 3,
};

function ReviewForm({ serviceId, closeModal }: { serviceId: string; closeModal: () => void }) {
  const { recordReview } = useRecordReview();

  /**
   * @dev If the user is a Collaborator, use the owner's TalentLayerId
   * @param values
   * @param setSubmitting
   * @param resetForm
   */
  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      await recordReview(values, serviceId);
      setSubmitting(false);
      closeModal();
      resetForm();
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
      {({ isSubmitting }) => (
        <Form>
          {/* {Object.keys(errors).map(errorKey => (
            <div key={errorKey}>{errors[errorKey]}</div>
          ))} */}
          <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
            <label className='block'>
              <span className='text-base-content'>Message</span>
              <Field
                as='textarea'
                id='content'
                name='content'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
                rows={5}
              />
              <span className='text-alone-error'>
                <ErrorMessage name='content' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>Rating</span>
              <Field
                type='number'
                id='rating'
                name='rating'
                min={0}
                max={5}
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
              />
              <span className='text-alone-error'>
                <ErrorMessage name='rating' />
              </span>
            </label>

            <SubmitButton isSubmitting={isSubmitting} label='Post your review' />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ReviewForm;
