import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useContext, useEffect, useState } from 'react';
import { useColor } from 'react-color-palette';
import 'react-color-palette/css';
import AccessDenied from '../../../components/AccessDenied';
import AdminSettingsLayout from '../../../components/AdminSettingsLayout';
import Loading from '../../../components/Loading';
import TalentLayerContext from '../../../context/talentLayer';
import BuilderPlaceContext from '../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { iBuilderPlacePalette } from '../../../modules/BuilderPlace/types';
import { sharedGetServerSideProps } from '../../../utils/sharedGetServerSideProps';
import ConfigurePlatformForm from '../../../components/ConfigurePlatform/ConfigurePlatformForm';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return sharedGetServerSideProps(context);
}

function ConfigurePlatform(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { loading } = useContext(TalentLayerContext);
  const { isBuilderPlaceCollaborator, builderPlace } = useContext(BuilderPlaceContext);
  const [palette, setPalette] = useState<iBuilderPlacePalette | undefined>(builderPlace?.palette);
  const [colorName, setColorName] = useState('primary');
  const [color, setColor] = useColor(
    palette ? palette[colorName as keyof iBuilderPlacePalette] : '#FF71A2',
  );

  useEffect(() => {
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    // Prevents max stack depth being called
    const delayedEffect = () => {
      setPalette(prevPalette => {
        if (!prevPalette) return;
        return { ...prevPalette, [colorName]: color.hex };
      });
    };

    timeoutId = setTimeout(delayedEffect, 10);
    return () => clearTimeout(timeoutId);
  }, [color]);

  useEffect(() => {
    if (!palette) return;

    document.documentElement.style.setProperty('--primary', palette.primary);
    document.documentElement.style.setProperty('--primary-50', palette.primary + '60');
    document.documentElement.style.setProperty('--primary-focus', palette.primaryFocus);
    document.documentElement.style.setProperty('--primary-content', palette.primaryContent);
    document.documentElement.style.setProperty('--base-100', palette.base100);
    document.documentElement.style.setProperty('--base-200', palette.base200);
    document.documentElement.style.setProperty('--base-300', palette.base300);
    document.documentElement.style.setProperty('--base-content', palette.baseContent);
    document.documentElement.style.setProperty('--info', palette.info);
    document.documentElement.style.setProperty('--info-content', palette.infoContent);
    document.documentElement.style.setProperty('--success', palette.success);
    document.documentElement.style.setProperty('--success-50', palette.success + '60');
    document.documentElement.style.setProperty('--success-content', palette.successContent);
    document.documentElement.style.setProperty('--warning', palette.warning);
    document.documentElement.style.setProperty('--warning-content', palette.warningContent);
    document.documentElement.style.setProperty('--error', palette.error);
    document.documentElement.style.setProperty('--error-content', palette.errorContent);
  }, [palette]);

  //TODO a delete ?
  if (loading) {
    console.log('no data');
    return (
      <div className='flex flex-col mt-5 pb-8'>
        <Loading />
      </div>
    );
  }

  if (!isBuilderPlaceCollaborator) {
    return <AccessDenied />;
  }

  return (
    <>
      <AdminSettingsLayout title={'configure your place'} route={'/admin'}>
        <ConfigurePlatformForm />
      </AdminSettingsLayout>
    </>
  );
}

export default ConfigurePlatform;
