import { Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';
import { useCheckAvailability } from '../../modules/BuilderPlace/hooks/onboarding/useCheckAvailability';

interface IFormWithNameAndHandle {
  name: string;
  talentLayerHandle: string;
}

export function HandleInput({
  initialValue,
  existingHandle,
}: {
  initialValue: string;
  existingHandle?: string;
}) {
  const { values, setFieldValue, setFieldError } = useFormikContext<IFormWithNameAndHandle>();
  const checkAvailability = useCheckAvailability();

  useEffect(() => {
    if (!existingHandle) {
      const slugifiedName = slugify(values.name);
      setFieldValue('talentLayerHandle', slugifiedName);
    }
  }, [values.name, existingHandle, setFieldValue]);

  useEffect(() => {
    const validateName = async () => {
      const isTaken = await checkAvailability(values.talentLayerHandle, initialValue, 'handle');
      console.log('isTaken', isTaken);
      if (isTaken) {
        setFieldError('talentLayerHandle', 'Handle already taken');
      } else {
        setFieldError('talentLayerHandle', '');
      }
    };

    validateName();
  }, [values.talentLayerHandle, initialValue, setFieldError]);

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
        initialvalue={initialValue}
      />
      {!!existingHandle && (
        <p className='font-alt text-xs font-normal opacity-80 text-gray-500'>
          This account already owns a TalentLayer account. If you wish to create a new TalentLayer
          handle, use another Ethereum account.
        </p>
      )}
    </>
  );
}
