import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'heroicons-react';

function SearchServiceButton(props?: { value?: string | null }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchQuery(props!.value || '');
  }, [props!.value]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const formElm = e.target as HTMLFormElement;
    const searchQueryRef = formElm.querySelector('input')!.value;
    if (searchQueryRef.length > 0) {
      router.push(`/work/?search=${searchQueryRef}`);
    } else router.push('/work');
  }, []);

  return (
    <form onSubmit={e => handleSubmit(e)} className='flex'>
      <div className='flex justify-end'>
        <div
          className={`flex flex-row flex-wrap rounded-3xl border ${
            isFocused ? 'opacity-100' : 'opacity-80'
          }`}>
          <div className='px-4 flex flex-row items-center'>
            <input
              className='text-base-content opacity-50 py-3 pl-0 focus:ring-0 outline-none text-sm border-0 bg-base-200'
              type='text'
              placeholder='Search by title'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={e => setIsFocused(true)}
              onBlur={e => setIsFocused(false)}
            />
          </div>
          <div className='px-2 flex flex-row justify-between items-center'>
            <button
              type='submit'
              className='px-2 py-1 rounded-3xl text-sm hover:bg-primary-focus bg-primary text-primary'>
              <Search width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default SearchServiceButton;
