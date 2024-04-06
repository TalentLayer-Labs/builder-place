import Header from '../../components/Landing/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-white text-black'>
      <Header />
      <main>{children}</main>
    </div>
  );
}
