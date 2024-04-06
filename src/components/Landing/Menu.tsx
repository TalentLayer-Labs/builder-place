'use client';

import Link from 'next/link';
import { useState } from 'react';

function Menu() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='navbarOpen absolute right-4 top-1/2 z-50 flex h-10 w-10 -translate-y-1/2 flex-col items-center justify-center space-y-[6px] font-bold lg:hidden'
        aria-label='navbarOpen'
        name='navbarOpen'>
        <span className='block h-[2px] w-7 bg-black '></span>
        <span className='block h-[2px] w-7 bg-black '></span>
        <span className='block h-[2px] w-7 bg-black '></span>
      </button>
      <div className={`menu-wrapper relative ${isOpen ? '' : 'hidden'} justify-between lg:flex`}>
        <button
          onClick={() => setIsOpen(false)}
          className='navbarClose fixed top-10 right-10 z-[9999] flex h-10 w-10 flex-col items-center justify-center font-bold lg:hidden'
          name='navbarClose'
          aria-label='navbarClose'>
          <span className='block h-[2px] w-7 rotate-45 bg-black '></span>
          <span className='-mt-[2px] block h-[2px] w-7 -rotate-45 bg-black '></span>
        </button>

        <nav className='fixed top-0 left-0 z-[999] flex h-screen w-full items-center justify-center bg-white bg-opacity-95 text-center backdrop-blur-sm lg:static lg:h-auto lg:w-max lg:bg-transparent lg:backdrop-blur-none '>
          <ul className='items-center space-y-3 lg:flex lg:space-x-8 lg:space-y-0 xl:space-x-10'>
            <li className='menu-item'>
              <Link
                onClick={() => setIsOpen(false)}
                href='/#video'
                className='menu-scroll inline-flex items-center text-base font-medium text-black hover:text-redpraha   lg:py-7'>
                about
              </Link>
            </li>
            <li className='menu-item'>
              <Link
                onClick={() => setIsOpen(false)}
                href='/#features'
                className='menu-scroll inline-flex items-center text-base font-medium text-black hover:text-redpraha   lg:py-7'>
                features
              </Link>
            </li>
            <li className='menu-item'>
              <Link
                onClick={() => setIsOpen(false)}
                href='/#pricing'
                className='menu-scroll inline-flex items-center text-base font-medium text-black hover:text-redpraha   lg:py-7'>
                pricing
              </Link>
            </li>
            <li className='menu-item'>
              <Link
                onClick={() => setIsOpen(false)}
                href='/#contact'
                className='menu-scroll inline-flex items-center text-base font-medium text-black hover:text-redpraha   lg:py-7'>
                support
              </Link>
            </li>
            <li>
              <Link
                href='/worker-landing'
                className='rounded-md text-center bg-redpraha py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-bold text-stone-800 hover:bg-opacity-60'>
                i'm a contributor
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default Menu;
