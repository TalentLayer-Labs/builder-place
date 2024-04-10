import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useChainId } from '../../../hooks/useChainId';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../../../utils/toast';
import * as Yup from 'yup';
import TalentLayerPlatformId from '../../../contracts/ABI/TalentLayerPlatformID.json';
import { getConfig } from '../../../config';
import { getUserBy } from '../../../modules/BuilderPlace/request';
import UserProfileDisplay from './UserProfileDisplay';
import { useState } from 'react';
import { User } from '@prisma/client';
import Loading from '../../../components/Loading';
import useGetPlatformBy from '../../../modules/BuilderPlace/hooks/platform/useGetPlatformBy';
import { useMutation } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { IMutation } from '../../../types';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export interface IFormValues {
  toAddress: string;
}

export interface ITransferPlatformOwnership extends IMutation<{ ownerId: number }> {}

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
  const router = useRouter();
  const { platform } = useGetPlatformBy({ ownerAddress: address });
  const [isFetchingUser, setIsFetchingUser] = useState<boolean>(false);
  const [returnedUser, setReturnedUser] = useState<User | undefined>();
  const [previousValue, setPreviousValue] = useState<string>('');
  const platformMutation = useMutation(
    async (body: ITransferPlatformOwnership): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put(`/api/platforms/transfer-owner/${platform?.id}`, body);
    },
  );

  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      if (
        values.toAddress === undefined ||
        !platform ||
        !walletClient ||
        !returnedUser ||
        !address
      ) {
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

      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      await platformMutation.mutateAsync({
        data: {
          ownerId: returnedUser.id,
        },
        signature: signature,
        address: address,
        domain: `${window.location.hostname}${
          window.location.port ? ':' + window.location.port : ''
        }`,
      });

      toast.success('Congrats! Your platform was successfully transferred');

      if (callback) {
        callback();
      }

      resetForm();

      setSubmitting(false);
    } catch (error) {
      showErrorTransactionToast(error);
    } finally {
      router.push('/dashboard');
    }
  };

  const validateInput = async (value: string) => {
    if (value === previousValue) return;

    setPreviousValue(value);
    setReturnedUser(undefined);

    if (value.match(ethAddressRegex)) {
      setIsFetchingUser(true);

      const user = await getUserBy({ address: value });

      setIsFetchingUser(false);

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
      validateOnBlur={false}
      onSubmit={onSubmit}>
      {({ isSubmitting }) => (
        <Form>
          <label className='block'>
            <div className='mt-1 mb-4 flex rounded-md shadow-sm'>
              <Field
                type='text'
                id='toAddress'
                name='toAddress'
                className={`mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 ${
                  isFetchingUser && 'opacity-50'
                } shadow-sm focus:ring-opacity-50 mr-4`}
                placeholder='Transfer to...'
                disabled={isFetchingUser}
                validate={validateInput}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submission
                  }
                }}
              />
              {isFetchingUser && <Loading />}
            </div>
            {!!returnedUser && (
              <UserProfileDisplay user={returnedUser} isSubmitting={isSubmitting} />
            )}
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
