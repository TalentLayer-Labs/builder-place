import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import { useChainId } from '../../hooks/useChainId';
import { showErrorTransactionToast } from '../../utils/toast';
import Loading from '../Loading';
import SubmitButton from './SubmitButton';
import { useAddBuilderPlaceCollaborator } from '../../modules/BuilderPlace/hooks/UseAddBuilderPlaceCollaborator';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { toggleDelegation } from '../../contracts/toggleDelegation';
import { useConfig } from '../../hooks/useConfig';
import ProfileImage from '../ProfileImage';

interface IFormValues {
  collaborator: string;
}

const validationSchema = Yup.object({
  collaborator: Yup.string().required('Collaborator is required'),
});
const initialValues: IFormValues = {
  collaborator: '',
};
export const CollaboratorForm = ({ callback }: { callback?: () => void }) => {
  const chainId = useChainId();
  const config = useConfig();
  const { mutateAsync: addBuilderPlaceCollaboratorAsync } = useAddBuilderPlaceCollaborator();
  const { data: walletClient } = useWalletClient({ chainId });
  const { open: openConnectModal } = useWeb3Modal();
  const { user, account, refreshData } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const publicClient = usePublicClient({ chainId });

  if (!user?.id) {
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
      if (walletClient && account?.address && builderPlace?._id) {
        setSubmitting(true);
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          message: user.id,
          account: account.address,
        });

        /**
         * @dev Add new collaborator to the BuilderPlace
         */
        const response = await addBuilderPlaceCollaboratorAsync({
          ownerId: user.id,
          builderPlaceId: builderPlace._id,
          newCollaborator: values.collaborator,
          signature,
        });

        if (response?.error) {
          throw new Error(response.error);
        }

        // if address is not a delegated yet on chain
        if (user.delegates?.indexOf(values.collaborator) === -1) {
          /**
           * @dev Add the new collaborator as a delegate to the BuilderPlace owner
           */
          await toggleDelegation(
            chainId,
            user.id,
            config,
            values.collaborator,
            publicClient,
            walletClient,
            true,
          );

          resetForm();

          if (callback) {
            callback();
          }
        }
      }
    } catch (error) {
      console.log(error);
      showErrorTransactionToast(error);
    } finally {
      refreshData();
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
            <div className='block border border-base-300 rounded-lg border p-10'>
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
              <div className='border-b border-base-300 mt-10 mb-5'></div>
              <div className='flex justify-between'>
                <div className='flex items-center'>
                  <span className='text-base-content '>Learn more about&nbsp;</span>
                  <a
                    href='https://github.com/TalentLayer-Labs/builder-place'
                    target='_blank'
                    className='text-base-content underline hover:opacity-60'>
                    Collaborator
                  </a>
                </div>
                <SubmitButton isSubmitting={isSubmitting} label='Add' />
              </div>
            </div>
            <div className='mt-5'>
              <span className='text-base-content font-bold border-base-300 border-b-4'>
                Collaborators
              </span>
              <div className='border-b border-base-300 mb-4'></div>

              <label className='block'>
                <Field
                  type='text'
                  id='collaboratorFilter'
                  name='collaboratorFilter'
                  className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 focus:ring-opacity-50'
                  placeholder='Filter...'
                />
              </label>

              <div className='mt-5 flex justify-between border border-base-300 rounded-lg border p-10'>
                <div className='flex'>
                  <ProfileImage size={50} url={user?.description?.image_url} />
                  <div className='flex flex-col'>
                    <span className='ml-5 text-base-content font-bold'>Romain</span>
                    <span className='ml-5 text-base-content '>0x1234</span>
                  </div>
                </div>
                <div className='flex flex-row'>
                  <button type='submit' className=' px-5 py-2 mr-5 rounded-xl bg-red-500 text-white'>
                    Delete
                  </button>
                  <button type='submit' className=' px-5 py-2  rounded-xl bg-green-500 text-white'>
                    Grant Access
                  </button>
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
