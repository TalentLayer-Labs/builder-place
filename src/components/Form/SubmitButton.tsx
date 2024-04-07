import { useMutation } from '@tanstack/react-query';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import axios, { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useAccount } from 'wagmi';
import { ISendVerificationEmail } from '../../app/api/emails/send-verification/route';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import UserContext from '../../modules/BuilderPlace/context/UserContext';
import { createVerificationEmailToast } from '../../modules/BuilderPlace/utils/toast';
import { showErrorTransactionToast } from '../../utils/toast';

function SubmitButton({
  isSubmitting,
  label = 'Create',
  checkEmailStatus = false,
}: {
  isSubmitting: boolean;
  label?: string;
  checkEmailStatus?: boolean;
}) {
  const { isConnected } = useAccount();
  const { open: openConnectModal } = useWeb3Modal();
  const { user } = useContext(UserContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const sendVerificationEmailMutation = useMutation({
    mutationFn: async (
      body: ISendVerificationEmail,
    ): Promise<AxiosResponse<{ id: string; message: string }>> => {
      return await axios.post('/api/emails/send-verification', body);
    },
  });

  const handleSendVerificationEmail = async (e: any) => {
    e.preventDefault();
    const domain = builderPlace?.subdomain || builderPlace?.customDomain;
    if (user && domain) {
      try {
        await sendVerificationEmailMutation.mutateAsync({
          userId: user.id.toString(),
          domain: domain,
          name: user.name,
          to: user.email,
        });
        await createVerificationEmailToast();
      } catch (error: any) {
        showErrorTransactionToast(error);
      }
    }
  };

  return (
    <div className='flex flex-row justify-between items-center'>
      {isSubmitting ? (
        <button
          disabled
          type='submit'
          className='py-2 px-5 mr-2 bg-primary text-primary opacity-50 rounded-xl border inline-flex items-center'>
          <div
            className='inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-base-100 !border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1'
            role='status'>
            <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'></span>
          </div>
          Loading...
        </button>
      ) : isConnected ? (
        <div className='flex flex-col w-full'>
          <button type='submit' className='w-full px-5 py-2 rounded-xl bg-primary text-primary'>
            {label}
          </button>
          {checkEmailStatus && !user?.isEmailVerified && (
            <p className={'mt-1 text-base-content font-alt text-xs font-normal opacity-60'}>
              Want gassless experience?&nbsp;
              <button
                onClick={e => handleSendVerificationEmail(e)}
                className='text-base-content font-alt text-xs font-normal opacity-70 hover:opacity-50 focus:outline-none focus:underline'>
                Verify your email !
              </button>
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => {
            openConnectModal();
          }}
          type='button'
          className='grow px-5 py-2 rounded-xl bg-info text-base-content hover:bg-base-200  '>
          {'Connect first'}
        </button>
      )}
    </div>
  );
}

export default SubmitButton;
