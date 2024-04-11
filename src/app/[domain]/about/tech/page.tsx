import TechContent from './components/TechContent';

export default function BuilderPlaceTech() {
  return (
    <>
      <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
        <div className='flex py-2 px-6 sm:px-0 w-full mb-3'>
          <p className='text-2xl sm:text-4xl font-bold mt-12'>our tech</p>
        </div>
      </div>

      <TechContent />
    </>
  );
}
