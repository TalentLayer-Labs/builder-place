import Image from 'next/image';
import Link from 'next/link';
import Menu from './Menu';

function Header() {
  return (
    <header className='navbar fixed top-0 left-0 z-50 w-full border-stroke bg-white duration-300 '>
      <div className='container relative lg:max-w-[1305px] lg:px-10'>
        <div className='flex items-center justify-between'>
          <div className='block py-4 lg:py-0'>
            <Link href='/' className='block max-w-[145px] sm:max-w-[200px]'>
              <Image src='/logo-text-dark.png' alt='logo' width={256} height={41} />
            </Link>
          </div>
          <Menu />
        </div>
      </div>
    </header>
  );
}

export default Header;
