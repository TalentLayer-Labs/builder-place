import { getBuilderPlace } from '../../../modules/BuilderPlace/queries';
import React, { useContext } from 'react';
import TalentLayerContext from '../../../context/talentLayer';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import useCopyToClipBoard from '../../../hooks/useCopyToClipBoard';
import { ClipboardCopy, CheckCircle } from 'heroicons-react';
import Loading from '../../../components/Loading';

export async function getServerSideProps({ params }: any) {
  return await getBuilderPlace(params.domain);
}

const BASE_URL = global?.location?.origin;
const GIG_BOARD_IFRAME_PATH = 'services-embeddable';

const generateServicesEmbedUrl = (buyerId: string) => {
  return `${BASE_URL}/${GIG_BOARD_IFRAME_PATH}?buyerId=${buyerId}`;
};

const generateServicesEmbedIframeCode = (servicesEmbedUrl: string): string => {
  return `<iframe src="${servicesEmbedUrl}" width="600" height="400"></iframe>`;
};

export default function EmbedPlace() {
  const { user, loading } = useContext(TalentLayerContext);
  const { builderPlace, isBuilderPlaceOwner } = useContext(BuilderPlaceContext);
  const { isCopied: isIframeCopied, copyToClipboard: copyIframe } = useCopyToClipBoard();
  const { isCopied: isDomainCopied, copyToClipboard: copyDomain } = useCopyToClipBoard();

  if (loading) {
    return (
      <div className='flex justify-center items-center gap-10 flex-col pb-5 mt-5'>
        <Loading />
      </div>
    );
  }

  return (
    <div>
      {isBuilderPlaceOwner && (
        <div className='max-w-7xl mx-auto text-base-content'>
          <div className='-mx-6 -mt-6 sm:mx-0 sm:mt-0'>
            <div className='flex py-2 px-6 sm:px-0 items-center w-full mb-8'>
              <p className='text-2xl font-bold flex-1 mt-6'>Embed your place</p>
            </div>
          </div>
          <div className='flex flex-row justify-center gap-2'>
            <div className={'flex-1 border border-gray-700 rounded-xl'}>
              <p className={'text-xl font-bold flex-1 mt-6'}>Embeddable job board</p>
              <p>embed your job board on a page in your website. read the guide</p>
              <div className={'flex flex-row gap-2'}>
                <code className={'basis-5/6 border border-t-gray-500 rounded-xl p-2'}>
                  {user?.id && generateServicesEmbedIframeCode(generateServicesEmbedUrl(user.id))}
                </code>
                {!isIframeCopied ? (
                  <span
                    className={
                      'flex flex-row basis-1/6 items-center border-l border-t-gray-500 ml-2 px-2 py-1 hover:rounded-xl hover:cursor-pointer hover:bg-gray-200 hover:transition-all duration-150'
                    }
                    onClick={() =>
                      user?.id &&
                      copyIframe(generateServicesEmbedIframeCode(generateServicesEmbedUrl(user.id)))
                    }>
                    <ClipboardCopy />
                    <p className={'text-sm text-gray-500'}>Copy</p>
                  </span>
                ) : (
                  <span
                    className={
                      'flex flex-row basis-1/6 items-center border-l border-t-green-500 ml-2 px-2 py-1 rounded-xl bg-green-200'
                    }>
                    <CheckCircle />
                    <p className={'text-sm text-gray-500'}>Copied !</p>
                  </span>
                )}
              </div>
            </div>
            <div className={'flex-1 border border-gray-700 rounded-xl'}>
              <p className={'text-xl font-bold flex-1 mt-6'}>Shareable board</p>
              <p>share your hosted work board with your community</p>
              <div className={'flex flex-row gap-2'}>
                <p className={'basis-5/6 border border-t-gray-500 rounded-full p-2'}>
                  {builderPlace?.customDomain || builderPlace?.subdomain}
                </p>
                {!isDomainCopied && (builderPlace?.customDomain || builderPlace?.subdomain) ? (
                  <span
                    className={
                      'flex flex-row basis-1/6 items-center border-l border-t-gray-500 ml-2 px-2 py-1 hover:rounded-full hover:cursor-pointer hover:bg-gray-200 hover:transition-all duration-150'
                    }
                    onClick={() =>
                      copyDomain((builderPlace?.customDomain || builderPlace?.subdomain) as string)
                    }>
                    <ClipboardCopy />
                    <p className={'text-sm text-gray-500'}>Copy</p>
                  </span>
                ) : (
                  <span
                    className={
                      'flex flex-row basis-1/6 items-center border-l border-t-green-500 ml-2 px-2 py-1 rounded-full bg-green-200'
                    }>
                    <CheckCircle />
                    <p className={'text-sm text-gray-500'}>Copied !</p>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {isBuilderPlaceOwner && user?.id && (
        <div className={'flex flex-col items-center justify-center mt-4'}>
          <h1 className='text-title text-4xl mb-4 text-center'>Work Board Preview</h1>
          <iframe src={generateServicesEmbedUrl(user.id)} width='600' height='400'></iframe>
        </div>
      )}
    </div>
  );
}
