import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { slugify } from '../../../modules/BuilderPlace/utils';
import { useCheckNameAvailability } from '../../../modules/BuilderPlace/hooks/onboarding/useCheckAvailability';

interface IFormWithNameAndHandle {
  name: string;
  talentLayerPlatformName: string;
}

export function PlatformNameInput({
  initialValue,
  existingPlatformName,
}: {
  initialValue: string;
  existingPlatformName?: string;
}) {
  const { values, setFieldValue, setFieldError, setFieldTouched } =
    useFormikContext<IFormWithNameAndHandle>();
  const checkAvailability = useCheckNameAvailability();

  useEffect(() => {
    if (!existingPlatformName) {
      const slugifiedName = slugify(values.name);
      setFieldValue('talentLayerPlatformName', slugifiedName);
    }
  }, [values.name, existingPlatformName, setFieldValue]);

  useEffect(() => {
    const validateName = async () => {
      const isTaken = await checkAvailability(
        values.talentLayerPlatformName,
        initialValue,
        'platforms',
      );
      if (isTaken) {
        setFieldError('talentLayerPlatformName', 'Name already taken');
        setFieldTouched('talentLayerPlatformName', true);
      } else {
        setFieldError('talentLayerPlatformName', undefined);
      }
    };

    validateName();
  }, [values.talentLayerPlatformName, initialValue, setFieldError]);

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
        placeholder='your TalentLayer platform name'
        initialvalue={initialValue}
      />
      <span className='text-red-500'>
        <ErrorMessage name='talentLayerPlatformName' />
      </span>
      {!!existingPlatformName && (
        <p className='font-alt text-xs font-normal opacity-80 text-gray-500'>
          This account already owns a TalentLayer account. If you wish to create a new TalentLayer
          handle, use another Ethereum account.
        </p>
      )}
    </>
  );
}
