import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';
import { useCheckNameAvailability } from '../../modules/BuilderPlace/hooks/onboarding/useCheckAvailability';
import { debounce } from 'lodash';

interface IFormWithNameAndHandle {
  name: string;
  talentLayerHandle: string;
}

/**
 * @dev
 *
 * Async graph request validation field with formik required several important points:
 *     - Cache: prevent duplicate graph call for the same value
 *     - Call order: with async, we don't know which call will end first, so it's crucial to have mechanism to cancel previous call
 *     - Debounce: prevent graph call on every single field update. Note that the debounce can't be done directly to the validation due to Formik architecture so we apply it on the updateHandle fct.
 *
 * Process: Name change > generate handle > update handle field > validate handle field
 */
export function HandleInput({
  initialValue,
  existingHandle,
}: {
  initialValue: string;
  existingHandle?: string;
}) {
  const { values, setFieldValue, setFieldTouched, setFieldError, errors, touched, initialTouched } =
    useFormikContext<IFormWithNameAndHandle>();
  const checkAvailability = useCheckNameAvailability();

  const validateName = useCallback(
    async (value: string) => {
      const isAvailable = await checkAvailability(value, initialValue, 'users');
      if (isAvailable === false) {
        return 'Handle already taken';
      }
      return;
    },
    [initialValue],
  );

  const updateHandle = useCallback((newName: string, existingHandle?: string) => {
    if (!existingHandle && newName.length > 0) {
      const slugifiedName = slugify(newName);
      setFieldValue('talentLayerHandle', slugifiedName);
      setFieldError('talentLayerHandle', undefined);
    }
  }, []);

  const debounceUpdateHandle = useCallback(debounce(updateHandle, 500), []);

  useEffect(() => {
    debounceUpdateHandle(values.name, existingHandle);
  }, [values.name, existingHandle]);

  return (
    <>
      <Field
        type='text'
        id='talentLayerHandle'
        name='talentLayerHandle'
        disabled={!!existingHandle}
        className={`mt-1 mb-1 block w-full ${
          !!existingHandle && 'text-gray-400'
        } rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50`}
        placeholder='your handle'
        validate={validateName}
      />
      {!!existingHandle && (
        <p className='font-alt text-xs font-normal opacity-80 text-gray-500'>
          This account already owns a TalentLayer account. If you wish to create a new TalentLayer
          handle, use another Ethereum account.
        </p>
      )}
      <span className='text-red-500'>{errors.talentLayerHandle}</span>
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
