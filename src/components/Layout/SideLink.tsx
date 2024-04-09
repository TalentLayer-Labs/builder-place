import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function SideLink({ children, href }: { children: React.ReactNode; href: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isRootPages = href == '/dashboard' || href === '/profiles' || href === '/';
  let className = isRootPages
    ? pathname === href
      ? 'bg-base-200'
      : ''
    : pathname?.includes(href)
    ? 'bg-base-200'
    : '';

  className +=
    ' hover:bg-base-200 text-base-content group flex items-center px-3 py-2 text-base-content rounded-xl';

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

export default SideLink;
