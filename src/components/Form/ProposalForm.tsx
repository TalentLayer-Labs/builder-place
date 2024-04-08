import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import * as Yup from 'yup';
import useAllowedTokens from '../../hooks/useAllowedTokens';
import useCreateProposal from '../../modules/BuilderPlace/hooks/proposal/useCreateProposal';
import useUpdateProposal from '../../modules/BuilderPlace/hooks/proposal/useUpdateProposal';
import { IProposal, IService } from '../../types';
import { showErrorTransactionToast } from '../../utils/toast';
import ProposalPostingFee from '../ProposalPostingFee';
import RateAmountMessage from '../RateAmountMessage';
import ServiceItem from '../ServiceItem';
import SubmitButton from './SubmitButton';

export interface IProposalFormValues {
  about: string;
  rateToken: string;
  rateAmount: number;
  expirationDate: number;
  video_url: string;
}

const validationSchema = Yup.object({
  about: Yup.string().required('please provide a description of your mission'),
  rateToken: Yup.string().required('please select a payment currency'),
  rateAmount: Yup.string().required('please provide an requested amount'),
  expirationDate: Yup.number().integer().required('please provide an expiration date'),
});

function ProposalForm({
  service,
  existingProposal,
}: {
  service: IService;
  existingProposal?: IProposal;
}) {
  const router = useRouter();
  const allowedTokenList = useAllowedTokens();
  const { createNewProposal } = useCreateProposal();
  const { updateProposal } = useUpdateProposal();

  if (allowedTokenList.length === 0) {
    return <div>Loading...</div>;
  }

  let existingExpirationDate, existingRateTokenAmount;

  if (existingProposal) {
    existingExpirationDate = Math.floor(
      (Number(existingProposal?.expirationDate) - Date.now() / 1000) / (60 * 60 * 24),
    );

    const token = allowedTokenList.find(
      token => token.address === existingProposal?.rateToken.address,
    );

    existingRateTokenAmount = parseFloat(
      formatUnits(BigInt(existingProposal.rateAmount), Number(token?.decimals)),
    );
  }

  let defaultRateAmount;
  if (service.description?.rateAmount && service.description?.rateToken) {
    const token = allowedTokenList.find(token => token.address === service.description?.rateToken);

    defaultRateAmount = parseFloat(
      formatUnits(BigInt(service.description?.rateAmount), Number(token?.decimals)),
    );
  }

  const initialValues: IProposalFormValues = {
    about: existingProposal?.description?.about || '',
    rateToken: existingProposal?.rateToken.address || service.description?.rateToken || '',
    rateAmount: existingRateTokenAmount || defaultRateAmount || 0,
    expirationDate: existingExpirationDate || 15,
    video_url: existingProposal?.description?.video_url || '',
  };

  const onSubmit = async (
    values: IProposalFormValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void },
  ) => {
    try {
      const token = allowedTokenList.find(token => token.address === values.rateToken);
      if (token) {
        existingProposal
          ? await updateProposal(values, token, service.id)
          : await createNewProposal(values, token, service.id);

        setSubmitting(false);
        resetForm();
      }
    } catch (error) {
      showErrorTransactionToast(error);
    } finally {
      router.push(`/work/${service.id}`);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={true}>
      {({ isSubmitting, values }) => (
        <Form>
          <h2 className='mb-2 text-base-content font-bold'>the mission</h2>
          <ServiceItem service={service} />

          <h2 className=' mt-8 mb-2 text-base-content font-bold'>how can you help?</h2>
          <p className='text-sm mb-2'>
            describe how you can help achive the goals of the open-source mission and why you want
            to help
          </p>
          <div className='grid grid-cols-1 gap-6 border border-info rounded-xl p-6 bg-base-100'>
            <label className='block'>
              <span className='text-base-content'>about</span>
              <Field
                as='textarea'
                id='about'
                rows={8}
                name='about'
                className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='about' />
              </span>
            </label>

            <div className='flex'>
              <label className='block flex-1 mr-4'>
                <span className='text-base-content'>amount requested</span>
                <Field
                  type='number'
                  id='rateAmount'
                  name='rateAmount'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''
                />
                <RateAmountMessage
                  allowedTokenList={allowedTokenList}
                  selectTokenAddress={values.rateToken}
                />
                <span className='text-alone-error'>
                  <ErrorMessage name='rateAmount' />
                </span>
              </label>
              <label className='block'>
                <span className='text-base-content'>token</span>
                <Field
                  component='select'
                  id='rateToken'
                  name='rateToken'
                  className='mt-1 mb-2 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder=''>
                  <option value=''>select a currency</option>
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
            <label className='block flex-1'>
              <span className='text-base-content'>days until proposal expiration</span>
              <Field
                type='number'
                id='expirationDate'
                name='expirationDate'
                className='mt-1 mb-2 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                placeholder=''
              />
              <span className='text-alone-error'>
                <ErrorMessage name='expirationDate' />
              </span>
            </label>

            {!existingProposal && <ProposalPostingFee />}

            <SubmitButton isSubmitting={isSubmitting} label='Post' />
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ProposalForm;
