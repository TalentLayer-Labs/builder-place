import Link from 'next/link';
import React from 'react';

function Error500() {
  return (
    <main className='grid min-h-full place-items-center bg-base-100 px-6 py-24 sm:py-32 lg:px-8'>
      <div className='text-center'>
        <p className='text-base-content font-semibold text-primary'>500</p>
        <h1 className='mt-4 text-3xl font-bold tracking-tight text-base-content sm:text-5xl'>
          internal server error
        </h1>
        <p className='mt-6 text-base-content leading-7 text-base-content'>
          Oops! Something went wrong on our end. Please try again later.
        </p>
        <div className='mt-10 flex items-center justify-center gap-x-6'>
          <Link
            href='/'
            className='rounded-md bg-info px-3.5 py-2.5 text-sm font-semibold text-base-content shadow-sm hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'>
            go back home
          </Link>
          <Link href='/messaging' className='text-sm font-semibold text-base-content'>
            contact support <span aria-hidden='true'>&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Error500;
