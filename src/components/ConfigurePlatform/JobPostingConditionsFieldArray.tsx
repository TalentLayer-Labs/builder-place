import { ErrorMessage, Field, FieldArray } from 'formik';
import { JobConditionsChainIdEnum, JobPostingConditions } from '../../modules/BuilderPlace/types';
import { isAddress } from 'viem';
import JobPostingConditionCard from './JobPostingConditionCard';
import { ZERO_ADDRESS } from '../../utils/constant';
import useGetContractData from '../../hooks/useGetContractData';
import AsyncButton from '../AsyncButton';
import { ethers } from 'ethers';
import { getChainData } from '../../modules/BuilderPlace/utils/chain';

export interface TempFormValues {
  tempNftAddress?: string;
  tempTokenAddress?: string;
  tempNftContractName?: string;
  tempTokenContractName?: string;
  tempTokenAmount?: number;
  tempNftChainId: JobConditionsChainIdEnum;
  tempTokenChainId: JobConditionsChainIdEnum;
}
interface JobPostingConditionsProps {
  existingJobPostingConditions?: JobPostingConditions;
  tempFormValues?: TempFormValues;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldError: (field: string, message: string | undefined) => void;
}

function JobPostingConditionsFieldArray({
  setFieldValue,
  existingJobPostingConditions,
  tempFormValues,
  setFieldError,
}: JobPostingConditionsProps) {
  const { getContractData, nftSubmitting, tokenSubmitting } = useGetContractData();

  const addJobPostingConditions = async (
    push: (obj: any) => void,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    setFieldError: (field: string, message: string | undefined) => void,
    jobCondition: {
      address?: string;
      minimumAmount?: number;
      chainId: JobConditionsChainIdEnum;
      type: 'NFT' | 'Token';
    },
  ): Promise<void> => {
    let error = false;
    let contractName = '';
    let tokenSign = '';
    let parsedMinimumAmount = '';
    if (!jobCondition.address || (jobCondition.address && !isAddress(jobCondition.address))) {
      setFieldError(
        jobCondition.type === 'NFT'
          ? 'tempFormValues.tempNftAddress'
          : 'tempFormValues.tempTokenAddress',
        'Invalid Ethereum address',
      );
      error = true;
    } else {
      const response = await getContractData(
        jobCondition.chainId,
        jobCondition.type,
        jobCondition.address,
      );
      if (response.error) {
        console.log('error', response.error);
        error = true;
        setFieldError(
          jobCondition.type === 'NFT'
            ? 'tempFormValues.tempNftAddress'
            : 'tempFormValues.tempTokenAddress',
          'Contract not found',
        );
      } else {
        contractName = response.contractName;
        tokenSign = response.tokenSign;

        if (jobCondition.type === 'Token' && jobCondition.minimumAmount) {
          parsedMinimumAmount = ethers.utils
            .parseUnits(jobCondition.minimumAmount.toString(), response.decimals)
            .toString();
        }
      }
    }

    if (jobCondition.address === ZERO_ADDRESS) {
      setFieldError(
        jobCondition.type === 'NFT'
          ? 'tempFormValues.tempNftAddress'
          : 'tempFormValues.tempTokenAddress',
        'Zero address is not allowed',
      );
      error = true;
    }

    if (
      jobCondition.type === 'Token' &&
      (!jobCondition.minimumAmount || jobCondition.minimumAmount <= 0)
    ) {
      setFieldError('tempFormValues.tempTokenAmount', 'Amount must be positive');
      error = true;
    }

    if (error) return;
    push({ ...jobCondition, parsedMinimumAmount, name: contractName, symbol: tokenSign });
    resetErrorMessages();
  };

  // Dynamically constructing the ChainIds object from the ChainIdEnum
  const chainIds = Object.keys(JobConditionsChainIdEnum).filter(key => !isNaN(Number(key)));

  const chainIdOptions = chainIds.map(chainId => {
    const chainData = getChainData(chainId as unknown as JobConditionsChainIdEnum);
    return { label: chainData.name, value: chainData.id };
  });

  const resetErrorMessages = () => {
    setFieldValue('tempFormValues.tempNftAddress', '');
    setFieldValue('tempFormValues.tempTokenAddress', '');
    setFieldValue('tempFormValues.tempNftContractName', '');
    setFieldValue('tempFormValues.tempTokenContractName', '');
    setFieldValue('tempFormValues.tempTokenAmount', '');
    setFieldValue('tempFormValues.tempTokenChainId', '');
  };

  return (
    <div>
      <label className='block'>
        <span className='font-bold text-md'>Posting conditions</span>
      </label>

      <FieldArray name='jobPostingConditions.conditions'>
        {({ push, remove }) => (
          <div className='mb-2'>
            <div className='flex items-center mb-4 mt-2'>
              <Field
                type='checkbox'
                name='jobPostingConditions.allowPosts'
                className='w-6 h-6 border-info bg-base-200 shadow-sm focus:ring-opacity-50 rounded'
              />
              <label htmlFor='jobPostingConditions.allowPosts' className='ml-2 text-md font-medium'>
                Allow Posts
              </label>
            </div>
            <p className='mb-3 font-alt text-xs font-normal opacity-60'>
              Allow job postings for external users. You can add optional filters based on the
              ownership of NFTs or the detention of tokens.
            </p>

            {existingJobPostingConditions?.allowPosts && (
              <>
                <div className='flex-row mb-6'>
                  <div className='flex justify-between mb-2 flex-wrap'>
                    <div className='flex flex-1 flex-wrap'>
                      <Field
                        type='text'
                        name='tempFormValues.tempNftAddress'
                        placeholder='NFT Address'
                        className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                      <Field
                        as='select'
                        name='tempFormValues.tempNftChainId'
                        className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                        onChange={(e: any) =>
                          setFieldValue('tempFormValues.tempNftChainId', e.target.value)
                        }>
                        {chainIdOptions.map(option => (
                          <option
                            className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                            key={option.value}
                            value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <AsyncButton
                      label={'Add NFT Condition'}
                      isSubmitting={nftSubmitting}
                      validateButtonCss={
                        'w-52 grow px-5 py-2 my-1 rounded-xl bg-primary text-primary'
                      }
                      onClick={() =>
                        addJobPostingConditions(push, setFieldValue, setFieldError, {
                          type: 'NFT',
                          address: tempFormValues?.tempNftAddress,
                          chainId: tempFormValues?.tempNftChainId as JobConditionsChainIdEnum,
                        })
                      }
                    />
                  </div>
                  <div className='ml-4'>
                    <ErrorMessage
                      name='tempFormValues.tempNftAddress'
                      component='span'
                      className='text-red-500'
                    />
                  </div>
                </div>

                <div className='flex-row mb-6'>
                  <div className='flex justify-center flex-wrap'>
                    <div className='flex flex-1 flex-wrap'>
                      <Field
                        type='text'
                        name='tempFormValues.tempTokenAddress'
                        placeholder='Token Address'
                        className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                      <Field
                        as='select'
                        name='tempFormValues.tempTokenChainId'
                        className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                        onChange={(e: any) =>
                          setFieldValue('tempFormValues.tempTokenChainId', e.target.value)
                        }>
                        {chainIdOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <Field
                        type='number'
                        name='tempFormValues.tempTokenAmount'
                        placeholder='Minimum Amount'
                        className='flex-1 md:flex-initial my-1 mr-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                    </div>
                    <AsyncButton
                      label={'Add Token Condition'}
                      isSubmitting={tokenSubmitting}
                      validateButtonCss={
                        'w-52 grow px-5 py-2 my-1 rounded-xl bg-primary text-primary'
                      }
                      onClick={() =>
                        addJobPostingConditions(push, setFieldValue, setFieldError, {
                          type: 'Token',
                          address: tempFormValues?.tempTokenAddress,
                          minimumAmount: tempFormValues?.tempTokenAmount,
                          chainId: tempFormValues?.tempTokenChainId as JobConditionsChainIdEnum,
                        })
                      }
                    />
                  </div>
                  <div className='flex flex-col ml-4'>
                    <ErrorMessage
                      name='tempFormValues.tempTokenAddress'
                      component='span'
                      className='text-red-500'
                    />
                    <ErrorMessage
                      name='tempFormValues.tempTokenAmount'
                      component='span'
                      className='text-red-500'
                    />
                  </div>
                </div>

                <label className='block'>
                  <span className='font-bold text-md opacity-50 mt-4 mb-2'>
                    Existing conditions
                  </span>
                </label>

                <div className='space-y-4 mt-2'>
                  {existingJobPostingConditions?.conditions?.map((condition, index) => (
                    <JobPostingConditionCard condition={condition} index={index} remove={remove} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </FieldArray>
    </div>
  );
}

export default JobPostingConditionsFieldArray;
