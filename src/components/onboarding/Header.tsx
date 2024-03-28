import Image from 'next/image';
import Link from 'next/link';

function Header({ logoUrl, builderPlaceName }: { logoUrl?: string; builderPlaceName?: string }) {
  return (
    <header className='navbar w-full border-stroke bg-white duration-300'>
      <div className='container relative lg:max-w-[1305px] lg:px-10'>
        <div className='flex items-center justify-between h-[80px] px-2'>
          <div className='block py-4 lg:py-0'>
            <Link href='/' className='block max-w-[145px] sm:max-w-[200px]'>
              {logoUrl ? (
                <img src={logoUrl} alt={builderPlaceName} className='' />
              ) : (
                <Image src={`/logo-text-dark.png`} alt='logo' width={256} height={41} />
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
