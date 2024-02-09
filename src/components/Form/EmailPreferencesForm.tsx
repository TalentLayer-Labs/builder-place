import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Form, Formik } from 'formik';
import { useContext } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import SubmitButton from './SubmitButton';
import { Toogle } from './Toggle';
import Loading from '../Loading';
import { delegateUpdateProfileData } from '../request';
import TalentLayerContext from '../../context/talentLayer';
import TalentLayerID from '../../contracts/ABI/TalentLayerID.json';
import { useChainId } from '../../hooks/useChainId';
import { useConfig } from '../../hooks/useConfig';
import useUserById from '../../hooks/useUserById';
import { IEmailPreferences, EmailNotificationType } from '../../types';
import { postToIPFS } from '../../utils/ipfs';
import { createMultiStepsTransactionToast, showErrorTransactionToast } from '../../utils/toast';
import Web3mailCard from '../../modules/Web3mail/components/Web3mailCard';
import Web2mailCard from '../../modules/Web3mail/components/Web2mailCard';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { useUpdateEmailNotificationPreferencesMutation } from '../../modules/BuilderPlace/hooks/UseUpdateEmailNotificationPreferencesMutation';
import { toast } from 'react-toastify';

function EmailPreferencesForm() {
  const config = useConfig();
  const chainId = useChainId();
  const { open: openConnectModal } = useWeb3Modal();
  const { user, canUseDelegation, refreshData, workerProfile, loading } =
    useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const userDescription = user?.id ? useUserById(user?.id)?.description : null;
  const web2MailPreferences = workerProfile?.emailPreferences as IEmailPreferences;
  const emailNotificationType =
    process.env.NEXT_PUBLIC_EMAIL_MODE === 'web3'
      ? EmailNotificationType.WEB3
      : EmailNotificationType.WEB2;
  const { mutateAsync: updateEmailNotificationPreferencesAsync } =
    useUpdateEmailNotificationPreferencesMutation();

  if (!user?.id || loading || !workerProfile) {
    return <Loading />;
  }

  const initialValues: IEmailPreferences =
    emailNotificationType === EmailNotificationType.WEB3
      ? {
          activeOnNewService: userDescription?.web3mailPreferences?.activeOnNewService || true,
          activeOnNewProposal: userDescription?.web3mailPreferences?.activeOnNewProposal || true,
          activeOnProposalValidated:
            userDescription?.web3mailPreferences?.activeOnProposalValidated || true,
          activeOnFundRelease: userDescription?.web3mailPreferences?.activeOnFundRelease || true,
          activeOnReview: userDescription?.web3mailPreferences?.activeOnReview || true,
          activeOnPlatformMarketing:
            userDescription?.web3mailPreferences?.activeOnPlatformMarketing || false,
        }
      : {
          activeOnNewService: web2MailPreferences?.activeOnNewService,
          activeOnNewProposal: web2MailPreferences?.activeOnNewProposal,
          activeOnProposalValidated: web2MailPreferences?.activeOnProposalValidated,
          activeOnFundRelease: web2MailPreferences?.activeOnFundRelease,
          activeOnReview: web2MailPreferences?.activeOnReview,
          activeOnPlatformMarketing: web2MailPreferences?.activeOnPlatformMarketing,
        };

  const onSubmit = async (
    values: IEmailPreferences,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      if (emailNotificationType === EmailNotificationType.WEB2 && walletClient && workerProfile) {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: address,
          message: workerProfile.id.toString(),
        });

        const response = await updateEmailNotificationPreferencesAsync({
          preferences: values,
          userId: workerProfile.id.toString(),
          signature,
        });

        if (response.error) {
          showErrorTransactionToast(response.error);
        }

        if (response.message) {
          toast.success(response.message, {
            autoClose: 5000,
            closeOnClick: true,
          });
        }
      } else if (user && publicClient && walletClient) {
        const cid = await postToIPFS(
          JSON.stringify({
            title: userDescription?.title,
            role: userDescription?.role,
            image_url: userDescription?.image_url,
            video_url: userDescription?.video_url,
            name: userDescription?.name,
            about: userDescription?.about,
            skills: userDescription?.skills_raw,
            web3mailPreferences: {
              activeOnNewService: values.activeOnNewService,
              activeOnNewProposal: values.activeOnNewProposal,
              activeOnProposalValidated: values.activeOnProposalValidated,
              activeOnFundRelease: values.activeOnFundRelease,
              activeOnReview: values.activeOnReview,
              activeOnPlatformMarketing: values.activeOnPlatformMarketing,
            },
          }),
        );

        let tx;
        if (canUseDelegation) {
          const response = await delegateUpdateProfileData(chainId, user.id, user.address, cid);
          tx = response.data.transaction;
        } else {
          tx = await walletClient.writeContract({
            address: config.contracts.talentLayerId,
            abi: TalentLayerID.abi,
            functionName: 'updateProfileData',
            args: [user.id, cid],
            account: address,
          });
        }

        await createMultiStepsTransactionToast(
          chainId,
          {
            pending: 'Updating your preferences...',
            success: 'Congrats! Your preferences has been updated',
            error: 'An error occurred while updating your preferences',
          },
          publicClient,
          tx,
          'user',
          cid,
        );

        refreshData();
        setSubmitting(false);
      } else {
        openConnectModal();
      }
    } catch (error) {
      showErrorTransactionToast(error);
    }
  };

  return (
    <>
      <div className='grid grid-cols-1 gap-6'>
        {emailNotificationType === EmailNotificationType.WEB3 ? (
          <Web3mailCard />
        ) : (
          <Web2mailCard
            to={workerProfile?.email}
            userId={workerProfile?.id}
            name={workerProfile?.name}
            domain={builderPlace?.customDomain || builderPlace?.subdomain}
          />
        )}

        <Formik initialValues={initialValues} enableReinitialize={true} onSubmit={onSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <label className='block'>
                <div className='mb-2 ml-0.5'>
                  {emailNotificationType === EmailNotificationType.WEB3 && (
                    <div className='mb-4'>
                      <p className='font-heading text-base-content font-medium leading-none'>
                        2. setup your notification preferences
                      </p>
                      <p className='font-sans text-xs font-normal leading-normal text-base-content mt-0.5'>
                        receive email when:
                      </p>
                    </div>
                  )}

                  <Toogle
                    entityId={'activeOnNewProposal'}
                    label='a new proposal is posted on your open-source mission'
                  />

                  <Toogle
                    entityId={'activeOnProposalValidated'}
                    label='your proposal has been validated'
                  />

                  <Toogle entityId={'activeOnFundRelease'} label='You receive new income' />

                  <Toogle entityId={'activeOnReview'} label='You receive a new review' />

                  <Toogle
                    entityId={'activeOnNewService'}
                    label='a new open-source contribution mission corresponding to your skills is open'
                  />

                  <Toogle
                    entityId={'activeOnPlatformMarketing'}
                    label='important annoucements, new features, new partnerships..'
                  />
                </div>
              </label>

              <SubmitButton isSubmitting={isSubmitting} label='update preferences' />
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
}

export default EmailPreferencesForm;
