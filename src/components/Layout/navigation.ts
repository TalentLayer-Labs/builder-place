import {
  BriefcaseIcon,
  ChatBubbleBottomCenterIcon,
  UserIcon,
  UserPlusIcon,
  PresentationChartLineIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PlusCircleIcon,
  WrenchIcon,
  CodeBracketSquareIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { SVGProps } from 'react';

export interface MenuItem {
  name: string;
  href: string;
  icon: (
    props: SVGProps<SVGSVGElement> & { title?: string | undefined; titleId?: string | undefined },
  ) => JSX.Element;
  current: boolean;
}

export const hirerNavigation: MenuItem[] = [
  { name: 'dashboard', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'my place', href: '/', icon: BriefcaseIcon, current: false },
  { name: 'new mission', href: '/work/create', icon: PlusCircleIcon, current: false },
  { name: 'chat', href: '/messaging', icon: ChatBubbleBottomCenterIcon, current: false },
];

export const hirerAdminNavigation: MenuItem[] = [
  // { name: 'hirer profile', href: '/admin/hirer-profile', icon: UserIcon, current: false },
  {
    name: 'configure your platform',
    href: '/admin/configure-platform',
    icon: WrenchIcon,
    current: false,
  },
  {
    name: 'embed your place',
    href: '/admin/embed-place',
    icon: CodeBracketSquareIcon,
    current: false,
  },
];

export const ownerAdminNavigation: MenuItem[] = [
  {
    name: 'add collaborators',
    href: '/admin/collaborators',
    icon: UserPlusIcon,
    current: false,
  },
];

export const workerNavigation: MenuItem[] = [
  { name: 'missions', href: '/', icon: BriefcaseIcon, current: false },
  { name: 'dashboard', href: '/dashboard', icon: HomeIcon, current: false },
  { name: 'profile', href: '/profiles/edit', icon: UserIcon, current: false },
  { name: 'chat', href: '/messaging', icon: ChatBubbleBottomCenterIcon, current: false },
];

export const PlatformAdminNavigation: MenuItem[] = [
  {
    name: 'presentation',
    href: `/superadmin/presentation`,
    icon: PresentationChartLineIcon,
    current: false,
  },
  {
    name: 'fees strategies',
    href: `/superadmin/fees`,
    icon: ShieldCheckIcon,
    current: false,
  },
  {
    name: 'dispute',
    href: `/superadmin/dispute`,
    icon: ExclamationCircleIcon,
    current: false,
  },
  {
    name: 'web3Mail',
    href: `/superadmin/web3mail`,
    icon: EnvelopeIcon,
    current: false,
  },
];
