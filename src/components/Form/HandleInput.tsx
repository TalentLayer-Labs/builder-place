import { Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';
import useTalentLayerClient from '../../hooks/useTalentLayerClient';

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
  const talentLayerClient = useTalentLayerClient();
  const { values, setFieldValue, setFieldError } = useFormikContext<IFormWithNameAndHandle>();

  useEffect(() => {
    if (!existingHandle) {
      const slugifiedName = slugify(values.name);
      setFieldValue('talentLayerHandle', slugifiedName);
    }
  }, [values.name, existingHandle, setFieldValue]);

  useEffect(() => {
    async function checkAvailability() {
      if (values.talentLayerHandle.length >= 5 && values.talentLayerHandle !== initialValue) {
        const data = await talentLayerClient?.graphQlClient.get(`
          {
            users(where: {handle: "${values.talentLayerHandle}"}, first: 1) {
              id
            }
          }
        `);
        if (data.data.users.length == 0) {
          setFieldError('talentLayerHandle', 'Handle already taken');
        }
      }
    }

    checkAvailability();
  }, [values.talentLayerHandle, setFieldError]);

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
