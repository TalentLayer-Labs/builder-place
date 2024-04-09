import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useChainId } from '../../../hooks/useChainId';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../../../utils/toast';
import * as Yup from 'yup';
import TalentLayerPlatformId from '../../../contracts/ABI/TalentLayerPlatformID.json';
import { getConfig } from '../../../config';
import usePlatformByOwner from '../../../hooks/usePlatformByOwnerAddress';
import { getUserBy } from '../../../modules/BuilderPlace/request';
import UserProfileDisplay from './UserProfileDisplay';
import { useState } from 'react';
import { User } from '@prisma/client';

export interface IFormValues {
  toAddress: string;
}

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const validationSchema = Yup.object({
  toAddress: Yup.string().matches(ethAddressRegex, 'Invalid Ethereum address'),
});

function PlatformTransferForm({ callback }: { callback?: () => void }) {
  const chainId = useChainId();
  const config = getConfig(chainId);
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const platform = usePlatformByOwner(address);
  const [returnedUser, setReturnedUser] = useState<User | undefined>();

  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      if (values.toAddress === undefined || !platform || !walletClient) {
        return;
      }

      //  @ts-ignore
      const transaction = await walletClient.writeContract({
        address: config.contracts.talentLayerPlatformId,
        abi: TalentLayerPlatformId.abi,
        functionName: 'transferFrom',
        args: [address, values.toAddress, platform?.id],
      });

      await createMultiStepsTransactionToast(
        chainId,
        {
          pending: 'Updating informations ...',
          success: 'Congrats! Your informations has been updated',
          error: 'An error occurred while updating your informations',
        },
        publicClient,
        transaction,
        'platform',
      );

      if (callback) {
        callback();
      }

      resetForm();

      setSubmitting(false);
    } catch (error) {
      showErrorTransactionToast(error);
    }
  };

  const handleInputChange = async (value: string) => {
    setReturnedUser(undefined);
    if (value.match(ethAddressRegex)) {
      const user = await getUserBy({ address: value });
      console.log('found user', user);
      setReturnedUser(user);
      if (!user) {
        return 'User not found';
      }
    }
  };

  return (
    <Formik
      initialValues={{ toAddress: '' }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form>
          <label className='block'>
            <div className='mt-1 mb-4 flex rounded-md shadow-sm'>
              <Field
                type='text'
                id='toAddress'
                name='toAddress'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50 mr-4'
                placeholder='Transfer to...'
                validate={handleInputChange}
              />
              {/*<SubmitButton isSubmitting={isSubmitting} label='Transfer' />*/}
            </div>
            {returnedUser && <UserProfileDisplay user={returnedUser} isSubmitting={isSubmitting} />}
            <span className='text-alone-error'>
              <ErrorMessage name='toAddress' />
            </span>
          </label>
        </Form>
      )}
    </Formik>
  );
}

export default PlatformTransferForm;
