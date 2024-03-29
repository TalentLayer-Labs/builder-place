import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import { showErrorTransactionToast } from '../../utils/toast';
import Loading from '../Loading';
import SubmitButton from './SubmitButton';
import { ETH_ADDRESS_LENGTH, ETH_ADDRESS_REGEX } from '../../utils';
import useAddCollaborator from '../../modules/BuilderPlace/hooks/collaborator/useAddCollaborator';
import { IMutation } from '../../types';

export interface IAddBuilderPlaceCollaborator
  extends IMutation<{
    collaboratorAddress: string;
  }> {}
interface IFormValues {
  collaborator: string;
}

const validationSchema = Yup.object({
  collaborator: Yup.string()
    .required('Collaborator is required')
    .matches(ETH_ADDRESS_REGEX, 'Invalid Ethereum address format')
    .length(ETH_ADDRESS_LENGTH, `Invalid Ethereum address format`),
});

const initialValues: IFormValues = {
  collaborator: '',
};
export const CollaboratorForm = ({ callback }: { callback?: () => void }) => {
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const { addCollaborator } = useAddCollaborator();

  if (!talentLayerUser?.id) {
    return <Loading />;
  }

  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      setSubmitting(true);
      await addCollaborator(values.collaborator);
      resetForm();

      if (callback) {
        callback();
      }
    } catch (error: any) {
      console.log(error);
      showErrorTransactionToast(error);
    } finally {
      setSubmitting(false);
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
          <div className='grid grid-cols-1 gap-6'>
            <div className='block border border-base-300 rounded-lg p-10'>
              <span className='text-base-content font-bold'>
                Invite new members by wallet address
              </span>
              <div className='border-b border-base-300 mb-10 mt-10'></div>
              <span className='text-base-content '>Wallet Address</span>
              <label className='block'>
                <Field
                  type='text'
                  id='collaborator'
                  name='collaborator'
                  className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='0x...'
                />
              </label>
              <span className='text-alone-error'>
                <ErrorMessage name='collaborator' />
              </span>
              <div className='flex  lg:justify-between mr-2'>
                <div className='mb-2 flex-col lg:items-center'>
                  {/* <span className='text-base-content'>Learn more about&nbsp;</span>
                  <a
                    href='https://github.com/TalentLayer-Labs/builder-place'
                    target='_blank'
                    className='text-base-content underline hover:opacity-60'>
                    Collaborator
                  </a> */}
                </div>
                <div className='ml-2 mt-4'>
                  <SubmitButton isSubmitting={isSubmitting} label='Add' />
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CollaboratorForm;
