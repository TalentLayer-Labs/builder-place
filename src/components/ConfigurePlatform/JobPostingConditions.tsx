import { Field, FieldArray, ErrorMessage } from 'formik';
import { ChainIdEnum, JobPostingConditions } from '../../modules/BuilderPlace/types';
import { isAddress } from 'viem';
import JobPostingConditionCard from './JobPostingConditionCard';
import { ZERO_ADDRESS } from '../../utils/constant';

export interface TempFormValues {
  tempNftAddress?: string;
  tempTokenAddress?: string;
  tempTokenAmount?: number;
  tempNftChainId: ChainIdEnum;
  tempTokenChainId: ChainIdEnum;
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
  const addJobPostingConditions = (
    push: (obj: any) => void,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    setFieldError: (field: string, message: string | undefined) => void,
    jobCondition: {
      address?: string;
      minimumAmount?: number;
      chainId: ChainIdEnum;
      type: 'NFT' | 'Token';
    },
  ) => {
    let error = false;
    if (!jobCondition.address || (jobCondition.address && !isAddress(jobCondition.address))) {
      setFieldError('tempFormValues.tempNftAddress', 'Invalid Ethereum address');
      error = true;
    }
    if (jobCondition.address === ZERO_ADDRESS) {
      setFieldError('tempFormValues.tempNftAddress', 'Zero address is not allowed');
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

    push(jobCondition);
    setFieldValue('tempFormValues.tempNftAddress', '');
    setFieldValue('tempFormValues.tempTokenAddress', '');
    setFieldValue('tempFormValues.tempTokenAmount', '');
    setFieldValue('tempFormValues.tempTokenChainId', '');
  };

  // Dynamically constructing the ChainIds object from the ChainIdEnum
  const ChainIds = Object.keys(ChainIdEnum)
    .filter(key => isNaN(Number(key)))
    .reduce((obj: Record<string, ChainIdEnum>, key) => {
      obj[key] = ChainIdEnum[key as keyof typeof ChainIdEnum];
      return obj;
    }, {} as Record<string, ChainIdEnum>);

  // console.log('ChainIds', ChainIds);

  const chainIdOptions = Object.entries(ChainIds).map(([key, value]) => {
    return { label: key, value: value };
  });

  // console.log('chainIdOptions', chainIdOptions);

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
              <label
                htmlFor='jobPostingConditions.allowPosts'
                className='ml-2 text-md font-medium text-gray-700'>
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
                  <div className='flex justify-between items-end mb-2'>
                    <div className='flex flex-1 items-end'>
                      <Field
                        type='text'
                        name='tempFormValues.tempNftAddress'
                        placeholder='NFT Address'
                        className='my-1 ml-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                      <Field
                        as='select'
                        name='tempFormValues.tempNftChainId'
                        className='my-1 ml-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                        onChange={(e: any) =>
                          setFieldValue('tempFormValues.tempNftChainId', e.target.value)
                        }>
                        {chainIdOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <button
                      type='button'
                      className='px-5 py-2 rounded-xl bg-primary text-primary w-52'
                      onClick={() => {
                        addJobPostingConditions(push, setFieldValue, setFieldError, {
                          type: 'NFT',
                          address: tempFormValues?.tempNftAddress,
                          chainId: tempFormValues?.tempNftChainId as ChainIdEnum,
                        });
                      }}>
                      Add NFT Condition
                    </button>
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
                  <div className='flex justify-between items-end'>
                    <div className='flex flex-1 items-end'>
                      <Field
                        type='text'
                        name='tempFormValues.tempTokenAddress'
                        placeholder='Token Address'
                        className='my-1 ml-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                      <Field
                        as='select'
                        name='tempFormValues.tempTokenChainId'
                        className='my-1 ml-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
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
                        className='my-1 ml-2 block rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                      />
                    </div>
                    <button
                      type='button'
                      className='px-5 py-2 rounded-xl bg-primary text-primary w-52'
                      onClick={() => {
                        addJobPostingConditions(push, setFieldValue, setFieldError, {
                          type: 'Token',
                          address: tempFormValues?.tempTokenAddress,
                          minimumAmount: tempFormValues?.tempTokenAmount,
                          chainId: tempFormValues?.tempTokenChainId as ChainIdEnum,
                        });
                      }}>
                      Add Token Condition
                    </button>
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
