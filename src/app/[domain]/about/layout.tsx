import OrganizationHeader from '../../../components/OrganizationHeader';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <OrganizationHeader />

      {children}
    </div>
  );
}
