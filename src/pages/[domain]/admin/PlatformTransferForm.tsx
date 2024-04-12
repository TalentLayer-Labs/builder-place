import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useAccount } from 'wagmi';
import { showErrorTransactionToast } from '../../../utils/toast';
import * as Yup from 'yup';
import { getUserBy } from '../../../modules/BuilderPlace/request';
import UserProfileDisplay from './UserProfileDisplay';
import { useState } from 'react';
import { User } from '@prisma/client';
import Loading from '../../../components/Loading';
import useGetPlatformBy from '../../../modules/BuilderPlace/hooks/platform/useGetPlatformBy';
import { IMutation } from '../../../types';
import { useRouter } from 'next/router';
import useTransferPlatform from '../../../modules/BuilderPlace/hooks/platform/useTransferPlatform';

export interface IFormValues {
  toAddress: string;
}

export interface ITransferPlatformOwnership extends IMutation<{ ownerId: number }> {}

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const validationSchema = Yup.object({
  toAddress: Yup.string().matches(ethAddressRegex, 'Invalid Ethereum address'),
});

function PlatformTransferForm({ callback }: { callback?: () => void }) {
  const { address } = useAccount();
  const router = useRouter();
  const { platform } = useGetPlatformBy({ ownerAddress: address });
  const [isFetchingUser, setIsFetchingUser] = useState<boolean>(false);
  const [returnedUser, setReturnedUser] = useState<User | undefined>();
  const [previousValue, setPreviousValue] = useState<string>('');
  const { transferPlatform } = useTransferPlatform();
  const onSubmit = async (
    values: IFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      if (values.toAddress === undefined || !platform || !returnedUser) {
        return;
      }

      await transferPlatform(values.toAddress, returnedUser.id);

      if (callback) {
        callback();
      }

      resetForm();

      setSubmitting(false);
      router.push('/dashboard');
    } catch (error) {
      showErrorTransactionToast(error);
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
