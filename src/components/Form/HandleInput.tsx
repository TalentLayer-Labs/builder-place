import { ErrorMessage, Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';
import { useCheckNameAvailability } from '../../modules/BuilderPlace/hooks/onboarding/useCheckAvailability';

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
  const { values, setFieldValue, setFieldError, setFieldTouched } =
    useFormikContext<IFormWithNameAndHandle>();
  const checkAvailability = useCheckNameAvailability();

  useEffect(() => {
    if (!existingHandle) {
      const slugifiedName = slugify(values.name);
      setFieldValue('talentLayerHandle', slugifiedName);
    }
  }, [values.name, existingHandle]);

  useEffect(() => {
    const validateName = async () => {
      const isTaken = await checkAvailability(values.talentLayerHandle, initialValue, 'users');
      console.log('isTaken', isTaken);
      if (isTaken) {
        setFieldError('talentLayerHandle', 'Handle already taken');
        setFieldTouched('talentLayerHandle', true);
      } else {
        setFieldError('talentLayerHandle', undefined);
      }
    };

    validateName();
  }, [values.talentLayerHandle]);

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
      />
      {!!existingHandle && (
        <p className='font-alt text-xs font-normal opacity-80 text-gray-500'>
          This account already owns a TalentLayer account. If you wish to create a new TalentLayer
          handle, use another Ethereum account.
        </p>
      )}
      <span className='text-red-500'>
        <ErrorMessage name='talentLayerHandle' />
      </span>
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
