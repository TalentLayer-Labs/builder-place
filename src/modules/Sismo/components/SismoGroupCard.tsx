import { ISismoGroup } from '../utils/types';
import { useContext } from 'react';
import TalentLayerContext from '../../../context/talentLayer';
import SismoHelpPopover from './SismoHelpPopover';
import Image from 'next/image';

function SismoGroupCard({
  sismoGroupData,
  userAddrss,
}: {
  sismoGroupData: ISismoGroup;
  userAddrss: string;
}) {
  const { user } = useContext(TalentLayerContext);
  const isConnectedUser = () => {
    return user?.address === userAddrss;
  };

  return (
    <div className='rounded-xl p-4 border border-info text-base-content bg-base-100'>
      <div className='flex flex-col items-top justify-between gap-4 w-full'>
        <div className='flex flex-col justify-start items-start gap-4 relative'>
          <div className='flex items-center justify-start'>
            <Image
              src={sismoGroupData.image}
              className='w-10 mr-4'
              alt=''
              width={200}
              height={200}
            />
            <div className='flex flex-col'>
              <p className='text-base-content font-medium break-all'>{sismoGroupData.name}</p>
            </div>
            <SismoHelpPopover>
              <h3 className='font-semibold text-base-content '>How to get this Badge ?</h3>
              <p>
                <strong>Description:</strong> {sismoGroupData.description}
                <br />
                <br />
                <strong>Specs:</strong> {sismoGroupData.specs}
              </p>
            </SismoHelpPopover>
          </div>
        </div>

        {isConnectedUser() && (
          <div className='flex flex-row gap-4 justify-between items-center border-t border-info pt-4'>
            <a
              target={'_blank'}
              className={`${
                sismoGroupData.userInGroup
                  ? 'text-content bg-zinc-50 hover:bg-zinc-500 hover:text-base-content'
                  : 'text-base-content bg-base-200 pointer-events-none'
              } px-5 py-2 rounded`}
              href={sismoGroupData.link}>
              Mint Badge
            </a>
            {sismoGroupData.userInGroup && (
              <Image
                src={`/purple_checkmark.svg`}
                className='w-4 mr-4 rounded-full'
                alt=''
                width={200}
                height={200}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SismoGroupCard;
