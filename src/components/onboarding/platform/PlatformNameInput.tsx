import { Field, useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { slugify } from '../../../modules/BuilderPlace/utils';
import { useCheckNameAvailability } from '../../../modules/BuilderPlace/hooks/onboarding/useCheckAvailability';
import { debounce } from 'lodash';

interface IFormWithNameAndPlatformName {
  name: string;
  talentLayerPlatformName: string;
}

/**
 * @dev
 *
 * Async graph request validation field with formik required several important points:
 *     - Cache: prevent duplicate graph call for the same value
 *     - Call order: with async, we don't know which call will end first, so it's crucial to have mechanism to cancel previous call
 *     - Debounce: prevent graph call on every single field update. Note that the debounce can't be done directly to the validation due to Formik architecture so we apply it on the updatePlatformName fct.
 *
 * Process: Name change > generate platform name > update platform name field > validate platform name field
 */
export function PlatformNameInput({
  initialValue,
  existingPlatformName,
}: {
  initialValue: string;
  existingPlatformName?: string;
}) {
  const { values, setFieldValue, setFieldTouched, setFieldError, errors, touched, initialTouched } =
    useFormikContext<IFormWithNameAndPlatformName>();
  const checkAvailability = useCheckNameAvailability();

  const validateName = useCallback(
    async (value: string) => {
      if (existingPlatformName !== value) {
        const isAvailable = await checkAvailability(value, initialValue, 'platforms');
        if (!isAvailable) {
          return 'Name already taken';
        }
      }
      return;
    },
    [initialValue],
  );

  const updatePlatformName = useCallback((newName: string, existingPlatformName?: string) => {
    if (!existingPlatformName && newName.length > 0) {
      const slugifiedName = slugify(newName);
      setFieldValue('talentLayerPlatformName', slugifiedName);
      setFieldError('talentLayerPlatformName', undefined);
    }
  }, []);

  const debounceUpdatePlatformName = useCallback(debounce(updatePlatformName, 500), []);

  useEffect(() => {
    debounceUpdatePlatformName(values.name, existingPlatformName);
  }, [values.name, existingPlatformName]);

  return (
    <>
      <Field
        type='text'
        id='talentLayerPlatformName'
        name='talentLayerPlatformName'
        disabled={!!existingPlatformName}
        className={`mt-1 mb-1 block w-full ${
          !!existingPlatformName && 'text-gray-400'
        } rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50`}
        placeholder='platform name'
        validate={validateName}
      />
      {!!existingPlatformName && (
        <p className='font-alt text-xs font-normal opacity-80 text-gray-500'>
          This account already owns a TalentLayer Platform. If you wish to create a new TalentLayer
          Platform, use another Ethereum account.
        </p>
      )}
      <span className='text-red-500'>{errors.talentLayerPlatformName}</span>
      <p className='font-alt text-xs font-normal'>
        <span className='text-base-content'>
          Used to create your onchain identity on{' '}
          <a href='https://talentlayer.org' target='_blank' className='underline text-info'>
            TalentLayer
          </a>
          .
        </span>
      </p>
    </>
  );
}
