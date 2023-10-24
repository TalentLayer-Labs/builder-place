import Image from 'next/image';
import { useContext } from 'react';
import SpaceContext from '../../modules/MultiDomain/context/SpaceContext';

export default function SpaceHome() {
  const { space } = useContext(SpaceContext);

  return (
    <div>
      Space Home from
      {space && <Image src={space.logo} alt={'logo'} width={100} height={100} />}
      {space?.logo}
      <br />
      List of gigs
    </div>
  );
}
