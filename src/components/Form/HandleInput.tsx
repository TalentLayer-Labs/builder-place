import { Field, useFormikContext } from 'formik';
import { useEffect } from 'react';
import { slugify } from '../../modules/BuilderPlace/utils';

interface IFormWithName {
  name: string;
}

export function HandleInput({}: {}) {
  const { values, setFieldValue } = useFormikContext<IFormWithName>();

  useEffect(() => {
    const slugifiedName = slugify(values.name);
    setFieldValue('handle', slugifiedName);
  }, [values.name, setFieldValue]);

  return (
    <>
      <Field
        type='text'
        id='handle'
        name='handle'
        className='mt-1 mb-1 block w-full rounded-xl border-2 border-info bg-base-200 shadow-sm focus:ring-opacity-50'
        placeholder='your handle'
      />
    </>
  );
}
