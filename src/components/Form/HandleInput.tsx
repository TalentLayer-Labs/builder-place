import { Field, useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';
import useTalentLayerClient from '../../hooks/useTalentLayerClient';
import { debounce } from 'lodash';

interface IFormWithNameAndHandle {
  name: string;
  talentLayerHandle: string;
}

export function HandleInput({ initiaValue }: { initiaValue: string }) {
  const talentLayerClient = useTalentLayerClient();
  const { values, setFieldValue, setFieldError } = useFormikContext<IFormWithNameAndHandle>();

  useEffect(() => {
    const slugifiedName = slugify(values.name);
    setFieldValue('talentLayerHandle', slugifiedName);
  }, [values.name, setFieldValue]);

  useEffect(() => {
    async function checkAvailability() {
      if (values.talentLayerHandle.length >= 5 && values.talentLayerHandle !== initiaValue) {
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
        className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
        placeholder='your handle'
        initialvalue={initiaValue}
      />
    </>
  );
}
