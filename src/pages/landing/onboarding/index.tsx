import { useState } from 'react';
import { useCreateSpaceMutation } from '../../../modules/MultiDomain/hooks/UseCreateSpaceMutation';
import { generateSubdomainPrefix } from '../../../modules/MultiDomain/utils';

function onboardingStep1() {
  const { mutateAsync: createSpaceAsync } = useCreateSpaceMutation();
  const [name, setName] = useState('');

  const sendDomain = async () => {
    const subdomainPrefix = generateSubdomainPrefix(name);
    const subdomain = `${subdomainPrefix}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
    await createSpaceAsync({
      subdomain: subdomain,
      name: name,
      pallete: {
        primary: '#000000',
        'primary-focus': '#ffffff',
        'primary-content': '#ffffff',
        'base-100': '#ffffff',
        'base-200': '#ffffff',
        'base-300': '#ffffff',
        'base-content': '#ffffff',
        info: '#ffffff',
        'info-content': '#ffffff',
        success: '#ffffff',
        'success-content': '#ffffff',
        warning: '#ffffff',
        'warning-content': '#ffffff',
        error: '#ffffff',
        'error-content': '#ffffff',
      },
    });
    window.location.href = `${window.location.protocol}//${subdomain}/admin`;
  };

  return (
    <>
      <div className='flex'>
        <label className='block flex-1 mr-4'>
          <label htmlFor='custom-domain' className='text-stone-800'>
            Name
          </label>
          <input
            type='string'
            id='name'
            className='mt-1 mb-1 block w-full rounded-xl border border-redpraha bg-midnight shadow-sm focus:ring-opacity-50'
            onChange={e => setName(e.target.value)}
          />
        </label>
      </div>
      <button onClick={sendDomain}>Go</button>
    </>
  );
}

export default onboardingStep1;
