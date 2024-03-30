import { useWeb3Modal } from '@web3modal/wagmi/react';
import { formatUnits } from 'viem';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import * as Yup from 'yup';
import TalentLayerContext from '../../context/talentLayer';
import { showErrorTransactionToast } from '../../utils/toast';
import SubmitButton from './SubmitButton';
import useAllowedTokens from '../../hooks/useAllowedTokens';
import { IService, IToken } from '../../types';
import { SkillsInput } from './skills-input';
import { useChainId } from '../../hooks/useChainId';
import { createWeb3mailToast } from '../../modules/Web3mail/utils/toast';
import Web3MailContext from '../../modules/Web3mail/context/web3mail';
import usePlatform from '../../hooks/usePlatform';
import { chains } from '../../context/web3modal';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import useCreateService from '../../modules/BuilderPlace/hooks/service/useCreateService';
import useUpdateService from '../../modules/BuilderPlace/hooks/service/useUpdateService';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { useAccount } from 'wagmi';

export interface ICreateServiceFormValues {
  title: string;
  about: string;
  keywords: string;
  rateToken: string;
  rateAmount: number;
}

function ServiceForm({
  existingService,
  callback,
}: {
  existingService?: IService;
  callback?: () => void;
}) {
  const chainId = useChainId();
  const { open: openConnectModal } = useWeb3Modal();
  const account = useAccount();
  const { refreshWorkerProfile, canUseBackendDelegate } = useContext(TalentLayerContext);
  const { platformHasAccess } = useContext(Web3MailContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const router = useRouter();
  const allowedTokenList = useAllowedTokens();
  const [selectedToken, setSelectedToken] = useState<IToken>();
  const currentChain = chains.find(chain => chain.id === chainId);
  const platform = usePlatform(builderPlace?.talentLayerPlatformId);
  const servicePostingFee = platform?.servicePostingFee || 0;
  const servicePostingFeeFormat = servicePostingFee
    ? Number(formatUnits(BigInt(servicePostingFee), Number(currentChain?.nativeCurrency?.decimals)))
    : 0;
  const { createNewService } = useCreateService();
  const { updateService } = useUpdateService();

  const getFormattedTokenAmount = () => {
    const token = allowedTokenList.find(
      token => token.address === existingService?.description?.rateToken,
    );
    if (!token || !existingService?.description?.rateAmount) {
      return 0;
    }
    return Number(
      formatUnits(BigInt(existingService.description?.rateAmount), Number(token?.decimals)),
    );
  };

  const initialValues: ICreateServiceFormValues = {
    title: existingService?.description?.title || '',
    about: existingService?.description?.about || '',
    keywords: existingService?.description?.keywords_raw || '',
    rateToken: existingService?.description?.rateToken || '',
    rateAmount: getFormattedTokenAmount() || 0,
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Please provide a title for your mission'),
    about: Yup.string().required('Please provide a description of your mission'),
    rateToken: Yup.string().required('Please select a payment token'),
    rateAmount: Yup.number()
      .required('Please provide an amount for your mission')
      .when('rateToken', {
        is: (rateToken: string) => rateToken !== '',
        then: schema =>
          schema.min(
            selectedToken
              ? parseFloat(
                  formatUnits(
                    BigInt(selectedToken?.minimumTransactionAmount ?? 0n),
                    Number(selectedToken?.decimals),
                  ),
                )
              : 0,
            `Amount must be greater or equal than ${
              selectedToken
                ? formatUnits(
                    BigInt(selectedToken?.minimumTransactionAmount ?? 0n),
                    Number(selectedToken?.decimals),
                  )
                : 0
            }`,
          ),
      }),
  });

  /**
   * @dev Only the owner's TalentLayerId is used here (by owners of delegates)
   * @param values
   * @param setSubmitting
   * @param resetForm
   */
  const handleSubmit = async (
    values: ICreateServiceFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    if (account?.isConnected === true) {
      try {
        const token = allowedTokenList.find(token => token.address === values.rateToken);
        if (token) {
          const newId = existingService
            ? await updateService(values, token, existingService)
            : await createNewService(values, token);

          if (callback) {
            callback();
          }

          setSubmitting(false);
          resetForm();
          if (newId) {
            router.push(`/work/${newId}`);
          }
          if (process.env.NEXT_PUBLIC_EMAIL_MODE == 'web3' && !platformHasAccess) {
            createWeb3mailToast();
          }
        }
      } catch (error) {
        showErrorTransactionToast(error);
      } finally {
        if (canUseBackendDelegate) await refreshWorkerProfile();
      }
    } else {
      openConnectModal();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
            <label className='block'>
              <span className='text-base-content'>Title</span>
              <Field
                type='text'
                id='title'
                name='title'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='title' />
              </span>
            </label>

            <label className='block'>
              <span className='text-base-content'>About</span>
              <Field
                as='textarea'
                id='about'
                name='about'
                className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
                rows={12}
              />
              <span className='text-alone-error'>
                <ErrorMessage name='about' />
              </span>
              <div className='bg-info relative w-full transition-all duration-300 rounded-xl p-4'>
                <div className='flex w-full items-center gap-3'>
                  <InformationCircleIcon width={24} height={24} />
                  <div>
                    <h2 className='font-heading text-xs font-bold  mb-1'>
                      <span>Tips</span>
                    </h2>
                    <p className='font-alt text-xs font-normal'>
                      <span className='text-base-content'>
                        Your post supports markdown format. Learn more about how to write markdown{' '}
                        <a
                          href='https://stackedit.io/app#'
                          target='_blank'
                          className='underline text-info'>
                          here
                        </a>
                        .
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </label>

            <label className='block'>
              <span className='text-base-content'>Keywords</span>

              <SkillsInput
                initialValues={existingService?.description?.keywords_raw}
                entityId={'keywords'}
              />

              <Field type='hidden' id='keywords' name='keywords' />
            </label>

            <div className='flex'>
              <label className='block flex-1 mr-4'>
                <span className='text-base-content'>Amount</span>
                <Field
                  type='number'
                  id='rateAmount'
                  name='rateAmount'
                  className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
                <span className='text-alone-error mt-2'>
                  <ErrorMessage name='rateAmount' />
                </span>
                {servicePostingFeeFormat !== 0 && (
                  <span className='text-base-content'>
                    Fee for posting a service: {servicePostingFeeFormat}{' '}
                    {currentChain?.nativeCurrency.symbol}
                  </span>
                )}
              </label>
              <label className='block'>
                <span className='text-base-content'>Token</span>
                <Field
                  component='select'
                  id='rateToken'
                  name='rateToken'
                  className='mt-1 mb-1 block w-full rounded-xl border border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                  onChange={(e: { target: { value: string } }) => {
                    const token = allowedTokenList.find(token => token.address === e.target.value);
                    setSelectedToken(token);
                    setFieldValue('rateToken', e.target.value);
                  }}>
                  <option value=''>Select a token</option>
                  {allowedTokenList.map((token, index) => (
                    <option key={index} value={token.address}>
                      {token.symbol}
                    </option>
                  ))}
                </Field>
                <span className='text-alone-error'>
                  <ErrorMessage name='rateToken' />
                </span>
              </label>
            </div>

            <SubmitButton
              isSubmitting={isSubmitting}
              label={existingService ? 'Update' : 'Post'}
              checkEmailStatus={true}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ServiceForm;
