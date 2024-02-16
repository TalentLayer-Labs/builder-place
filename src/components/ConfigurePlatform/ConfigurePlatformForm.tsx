import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import SubdomainInput from '../Form/SubdomainInput';
import UploadImage from '../UploadImage';
import DefaultPalettes from '../DefaultPalettes';
import { themes } from '../../utils/themes';
import CustomizePalette from '../CustomizePalette';
import { slugify } from '../../modules/BuilderPlace/utils';
import {
  ChainIdEnum,
  iBuilderPlacePalette,
  JobPostingConditions,
} from '../../modules/BuilderPlace/types';
import { IMutation } from '../../types';
import * as Yup from 'yup';
import { useContext, useState } from 'react';
import TalentLayerContext from '../../context/talentLayer';
import BuilderPlaceContext from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { useChainId, useWalletClient } from 'wagmi';
import { useColor } from 'react-color-palette';
import { showErrorTransactionToast } from '../../utils/toast';
import useUpdatePlatform from '../../modules/BuilderPlace/hooks/platform/useUpdatePlatform';
import { isAddress } from 'viem';

export interface IConfigurePlaceFormValues {
  subdomain: string;
  palette?: iBuilderPlacePalette;
  logo?: string;
  name: string;
  baseline: string;
  about: string;
  aboutTech: string;
  icon?: string;
  cover?: string;
  jobPostingConditions?: JobPostingConditions;
  tempFormValues?: tempFormValues;
}

interface tempFormValues {
  tempNftAddress?: string;
  tempTokenAddress?: string;
  tempTokenAmount?: number;
  tempNftChainId: ChainIdEnum;
  tempTokenChainId: ChainIdEnum;
}

export interface IConfigurePlace
  extends IMutation<Omit<IConfigurePlaceFormValues, keyof tempFormValues>> {}

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

const validationSchema = Yup.object({
  subdomain: Yup.string().required('Subdomain is required'),

  // tempFormValues: Yup.object({
  //   tempNftAddress: Yup.string().matches(ethAddressRegex, 'Invalid Ethereum address').notRequired(),
  //
  //   tempTokenAddress: Yup.string()
  //     .matches(ethAddressRegex, 'Invalid Ethereum address')
  //     .notRequired(),
  //
  //   tempTokenAmount: Yup.number().positive('Amount must be positive').notRequired(),
  // }),
});

const ConfigurePlatformForm = () => {
  const { builderPlace } = useContext(BuilderPlaceContext);
  const chainId = useChainId();
  const [palette, setPalette] = useState<iBuilderPlacePalette | undefined>(builderPlace?.palette);
  const [colorName, setColorName] = useState('primary');
  const [color, setColor] = useColor(
    palette ? palette[colorName as keyof iBuilderPlacePalette] : '#FF71A2',
  );
  const { account, loading } = useContext(TalentLayerContext);
  const { data: walletClient } = useWalletClient({ chainId });
  const { updatePlatform } = useUpdatePlatform();

  const initialValues: IConfigurePlaceFormValues = {
    subdomain:
      //TODO why ??
      //   builderPlace?.subdomain?.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN as string}`, '') ||
      builderPlace?.subdomain || (builderPlace?.name && slugify(builderPlace.name)) || '',
    logo: builderPlace?.logo || '',
    palette,
    name: builderPlace?.name || '',
    baseline: builderPlace?.baseline || '',
    about: builderPlace?.about || '',
    aboutTech: builderPlace?.aboutTech || '',
    icon: builderPlace?.icon || '',
    cover: builderPlace?.cover || '',
    jobPostingConditions: builderPlace?.jobPostingConditions || {
      allowPosts: false,
      conditions: [],
    },
    tempFormValues: {
      tempNftAddress: '',
      tempTokenAddress: '',
      tempTokenAmount: 0,
      tempNftChainId: ChainIdEnum.ETHEREUM,
      tempTokenChainId: ChainIdEnum.ETHEREUM,
    },
  };

  const handleSubmit = async (
    values: IConfigurePlaceFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (walletClient && account?.address && builderPlace) {
      try {
        setSubmitting(true);
        await updatePlatform(values);
      } catch (error: any) {
        console.log('CATCH error', error);
        showErrorTransactionToast(error.message);
      } finally {
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      }
    }
  };

  function addJobPostingConditions(
    push: (obj: any) => void,
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    setFieldError: (field: string, message: string | undefined) => void,
    jobCondition: {
      address?: string;
      minimumAmount?: number;
      chainId: ChainIdEnum;
      type: 'NFT' | 'Token';
    },
  ) {
    let error = false;
    if (jobCondition.type === 'NFT') {
      if (!jobCondition.address || (jobCondition.address && !isAddress(jobCondition.address))) {
        setFieldError('tempFormValues.tempNftAddress', 'Invalid Ethereum address');
        error = true;
      }
    }
    if (jobCondition.type === 'Token') {
      if (!jobCondition.address || (jobCondition.address && !isAddress(jobCondition.address))) {
        setFieldError('tempFormValues.tempTokenAddress', 'Invalid Ethereum address');
        error = true;
      }
      if (!jobCondition.minimumAmount || jobCondition.minimumAmount <= 0) {
        setFieldError('tempFormValues.tempTokenAmount', 'Amount must be positive');
        error = true;
      }
    }

    if (error) return;

    push(jobCondition);
    setFieldValue('tempFormValues.tempNftAddress', '');
    setFieldValue('tempFormValues.tempTokenAddress', '');
    setFieldValue('tempFormValues.tempTokenAmount', '');
    setFieldValue('tempFormValues.tempTokenChainId', '');
  }

  // Dynamically constructing the ChainIds object from the ChainIdEnum
  const ChainIds = Object.keys(ChainIdEnum)
    .filter(key => isNaN(Number(key)))
    .reduce((obj: Record<string, ChainIdEnum>, key) => {
      obj[key] = ChainIdEnum[key as keyof typeof ChainIdEnum];
      return obj;
    }, {} as Record<string, ChainIdEnum>);

  const chainIdOptions = Object.entries(ChainIds).map(([key, value]) => {
    return { label: key, value: value };
  });

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}>
      {({ isSubmitting, setFieldValue, setFieldError, values }) => (
        <Form>
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <label className='block'>
                <span className='font-bold text-md'>organization name</span>
                <Field
                  type='text'
                  id='name'
                  name='name'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='your organization name goes here'
                />
              </label>
              <span className='text-red-500'>
                <ErrorMessage name='name' />
              </span>
            </div>

            <div>
              <label className='block'>
                <span className='font-bold text-md'>organization baseline</span>
                <Field
                  type='text'
                  id='baseline'
                  name='baseline'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='your organization baseline'
                />
              </label>
              <span className='text-red-500'>
                <ErrorMessage name='baseline' />
              </span>
            </div>

            <div>
              <label className='block'>
                <span className='font-bold text-md'>about your organization</span>
                <Field
                  as='textarea'
                  id='about'
                  name='about'
                  rows='9'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                  placeholder='tell everyone about what you work on and why you’re doing it (ps: open-source contributors love to hear about your mission and vision)'
                />
              </label>
              <p className='font-alt text-xs font-normal opacity-60'>
                <span className='text-base-content'>
                  This supports markdown format. Learn more about how to write markdown{' '}
                  <a
                    href='https://stackedit.io/app#'
                    target='_blank'
                    className='underline text-info'>
                    here
                  </a>
                  .
                </span>
              </p>
              <span className='text-red-500'>
                <ErrorMessage name='about' />
              </span>
            </div>

            <div>
              <label className='block'>
                <span className='font-bold text-md'>about your tech</span>
                <Field
                  as='textarea'
                  id='aboutTech'
                  name='aboutTech'
                  rows='9'
                  className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
                />
              </label>
              <p className='font-alt text-xs font-normal opacity-60'>
                <span className='text-base-content'>
                  This supports markdown format. Learn more about how to write markdown{' '}
                  <a
                    href='https://stackedit.io/app#'
                    target='_blank'
                    className='underline text-info'>
                    here
                  </a>
                  .
                </span>
              </p>
              <span className='text-red-500'>
                <ErrorMessage name='aboutTech' />
              </span>
            </div>

            <SubdomainInput />

            <UploadImage
              fieldName='logo'
              label='logo'
              legend='rectangle format, used in top of your place'
              src={values.logo}
              setFieldValue={setFieldValue}
            />

            <UploadImage
              fieldName='icon'
              label='icon'
              legend='square format'
              src={values.icon}
              setFieldValue={setFieldValue}
            />

            <UploadImage
              fieldName='cover'
              label='cover'
              legend='large rectangle format, used in top of your place'
              src={values.cover}
              setFieldValue={setFieldValue}
            />

            <DefaultPalettes
              onChange={palette => {
                setPalette(themes[palette as keyof typeof themes]);
              }}
            />

            {palette && (
              <CustomizePalette
                palette={palette}
                color={color}
                setColor={setColor}
                setColorName={setColorName}
              />
            )}

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
                      Allow job postings for external users. You can add optional filters based on
                      the ownership of NFTs or the detention of tokens.
                    </p>

                    {values.jobPostingConditions?.allowPosts && (
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
                              className='px-5 py-2 rounded-xl bg-primary text-primary'
                              onClick={() => {
                                addJobPostingConditions(push, setFieldValue, setFieldError, {
                                  type: 'NFT',
                                  address: values?.tempFormValues?.tempNftAddress,
                                  chainId: values?.tempFormValues?.tempNftChainId as ChainIdEnum,
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
                              className='px-5 py-2 rounded-xl bg-primary text-primary'
                              onClick={() => {
                                addJobPostingConditions(push, setFieldValue, setFieldError, {
                                  type: 'Token',
                                  address: values?.tempFormValues?.tempTokenAddress,
                                  minimumAmount: values?.tempFormValues?.tempTokenAmount,
                                  chainId: values?.tempFormValues?.tempTokenChainId as ChainIdEnum,
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

                        {values.jobPostingConditions?.conditions?.map((condition, index) => (
                          <div className='flex items-center mb-3' key={index}>
                            <div className='flex-1'>
                              {condition.type === 'NFT' ? (
                                <>
                                  <span>NFT Address: {condition.address}</span>
                                  <span> - Chain Id: {condition.chainId}</span>
                                </>
                              ) : (
                                <>
                                  <span>Token Address: {condition.address}</span>
                                  <span> - Chain Id: {condition.chainId}</span>
                                  <span> - Minimum Amount: {condition.minimumAmount}</span>
                                </>
                              )}
                            </div>
                            <button
                              type='button'
                              className={'px-5 py-2 rounded-xl bg-red-500 text-white'}
                              onClick={() => remove(index)}>
                              Delete
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </FieldArray>
            </div>

            {isSubmitting ? (
              <button
                disabled
                type='submit'
                className='grow px-5 py-2 rounded-xl bg-primary-50 text-primary'>
                Loading...
              </button>
            ) : (
              <button type='submit' className='grow px-5 py-2 rounded-xl bg-primary text-primary'>
                Sign and validate
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ConfigurePlatformForm;
