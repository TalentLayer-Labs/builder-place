import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import SubmitButton from './SubmitButton';
import * as Yup from 'yup';
import { showErrorTransactionToast } from '../../utils/toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../Loading';
import { useChainId } from '../../hooks/useChainId';
import { useWalletClient } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { NotificationType } from '../../types';
import { sendPlatformMarketingWeb3mail } from '../request';
import useFetchMyContacts, { IContact } from '../../modules/Web3mail/hooks/useFetchMyContacts';

interface IFormValues {
  subject: string;
  body: string;
  users: IContact[];
}

const validationSchema = Yup.object({
  subject: Yup.string()
    .max(77, 'Subject must be at most 77 characters')
    .required('Please provide a subject'),
  body: Yup.string().required('Please provide a body'),
  users: Yup.array().min(1).required('Please select at least one user'),
});

export const ContactListForm = ({
  userId,
  builderPlaceId,
  address,
}: {
  userId: string;
  builderPlaceId: string;
  address: `0x${string}` | undefined;
}) => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { open: openConnectModal } = useWeb3Modal();

  const notificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3' ? NotificationType.WEB3 : NotificationType.WEB2;
  const {
    contacts: contactList,
    contactsLoaded: usersLoaded,
    fetchFunctionCalled,
    fetchData,
  } = useFetchMyContacts(notificationType, userId, builderPlaceId, address, walletClient);

  const [allContractsAdded, setAllContractsAdded] = useState(false);

  const initialValues: IFormValues = {
    subject: '',
    body: '',
    users: [],
  };

  const handleAddOrRemoveAllContacts = (
    event: React.MouseEvent<HTMLInputElement>,
    arrayHelpers: any,
    users: IContact[],
  ) => {
    setAllContractsAdded(!allContractsAdded);
    if (!allContractsAdded) {
      contactList.forEach(userDetail => {
        if (!users.includes(userDetail)) {
          arrayHelpers.push(userDetail);
        }
      });
    } else {
      users.splice(0, users.length);
    }
  };

  const onSubmit = async (
    values: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (walletClient && address) {
      try {
        setSubmitting(true);

        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          message: builderPlaceId.toString(),
          account: address,
        });

        const userAddresses = values.users.map(contact => contact.address);

        const promise = sendPlatformMarketingWeb3mail(
          values.subject,
          values.body,
          userAddresses,
          builderPlaceId,
          signature,
        );

        await toast.promise(promise, {
          pending: `${
            userAddresses.length === 1 ? `Your email is` : `Your emails are`
          } being sent...`,
          success: `${userAddresses.length === 1 ? `Email ` : `Emails `} sent !`,
          error: `An error occurred while sending your ${
            userAddresses.length === 1 ? `emails` : `email`
          } `,
        });

        setSubmitting(false);
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
      {({ isSubmitting, values }) => (
        <Form>
          <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
            <label className='block'>
              <span className='text-base-content'>Subject</span>
              <Field
                type='text'
                id='subject'
                name='subject'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder='Type your subject here...'
              />
              <span className='text-alone-error'>
                <ErrorMessage name='subject' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>Body</span>
              <Field
                as='textarea'
                rows='4'
                id='body'
                name='body'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder='Type the email body here...'
              />
              <span className='text-alone-error'>
                <ErrorMessage name='body' />
              </span>
            </label>

            {notificationType === NotificationType.WEB2 && !usersLoaded && (
              <div className='mt-4 flex flex-col items-center'>
                <button
                  disabled={fetchFunctionCalled}
                  className={`${
                    fetchFunctionCalled && 'opacity-50'
                  } grow px-5 py-2 rounded-xl bg-primary text-primary`}
                  onClick={() => fetchData()}>
                  {fetchFunctionCalled && (
                    <svg
                      role='status'
                      className='inline mr-2 w-4 h-4 text-base-content animate-spin '
                      viewBox='0 0 100 101'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                        fill='currentColor'
                      />
                      <path
                        d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                        fill='#11112a'
                      />
                    </svg>
                  )}
                  {fetchFunctionCalled ? 'Loading...' : 'Fetch my contacts'}
                </button>
                <p className='text-sm mt-2 text-gray-600'>
                  A signature is required to get your contacts.
                </p>
              </div>
            )}

            {((notificationType === NotificationType.WEB2 && fetchFunctionCalled && usersLoaded) ||
              notificationType === NotificationType.WEB3) && (
              <div>
                <FieldArray
                  name='users'
                  render={arrayHelpers => (
                    <div className={'flex flex-row space-x-10'}>
                      <div className='block flex-auto'>
                        <span className='text-base-content mb-2'>Available Contacts</span>
                        <div className={'overflow-y-auto overflow-x-visible h-24'}>
                          {!usersLoaded && (
                            <div className={'flex flex-row'}>
                              <Loading />
                              <p className={'flex text-base-content justify-center ml-4'}>
                                Loading Contacts...
                              </p>
                            </div>
                          )}
                          {usersLoaded && contactList && contactList.length > 0
                            ? contactList.map((userDetail, index) => {
                                const addedUserIds = values.users.map(user => user.id);
                                const isAddressAlreadyAdded = addedUserIds.includes(userDetail.id);
                                return (
                                  <div
                                    key={index}
                                    className={`text-base-content flex items-center ${
                                      isAddressAlreadyAdded ? 'hidden' : ''
                                    }`}>
                                    {userDetail.name}
                                    <span onClick={() => arrayHelpers.insert(index, userDetail)}>
                                      <CheckCircleIcon className='ml-3 h-5 w-5 justify-center text-base-content cursor-pointer' />
                                    </span>
                                  </div>
                                );
                              })
                            : usersLoaded && (
                                <p className={'text-base-content mt-2'}>No Contacts</p>
                              )}
                        </div>
                        <div className={'flex flew-row mt-2 center-items'}>
                          <input
                            type='checkbox'
                            checked={allContractsAdded}
                            className='checked:bg-info0 cursor-pointer center-items mt-1'
                            onClick={event => {
                              handleAddOrRemoveAllContacts(event, arrayHelpers, values.users);
                            }}
                          />
                          <p className={'ml-2 mb-2 text-base-content center-items'}>
                            Add all contacts
                          </p>
                        </div>
                        <span className='text-alone-error'>
                          <ErrorMessage name='users' />
                        </span>
                      </div>
                      <label className='block flex-auto '>
                        <span className='text-base-content'>Selected Contacts</span>
                        <div className={'overflow-y-auto overflow-x-visible w-auto h-24'}>
                          {values.users.length > 0 ? (
                            values.users.map((contact, index) => (
                              <div key={index} className={'text-base-content items-center  flex'}>
                                {contact.name}
                                <span onClick={() => arrayHelpers.remove(index)}>
                                  <XCircleIcon
                                    className={
                                      'ml-3 h-5 w-5 justify-center text-base-content cursor-pointer'
                                    }
                                  />
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className={'text-base-content  mt-2'}>No Contacts</p>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                />

                <SubmitButton isSubmitting={isSubmitting} label='Send' />
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};
