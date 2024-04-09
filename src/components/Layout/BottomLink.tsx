import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function BottomLink({ children, href }: { children: React.ReactNode; href: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isRootPages = href == '/dashboard' || href === '/';
  let className = isRootPages
    ? pathname === href
      ? 'bg-base-200'
      : ''
    : pathname?.includes(href)
    ? 'bg-base-200'
    : '';

  className +=
    ' inline-flex font-light text-base-content flex-col items-center justify-center align-center group my-2 rounded-xl';

  const handleClick = (e: any) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

export default BottomLink;
