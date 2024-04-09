import { BuilderPlace } from '@prisma/client';
import CustomPalette from '../../components/CustomPalette';
import PlatformLayout from '../../components/Platform/Layout';
import { TalentLayerProvider } from '../../context/talentLayer';
import { getBuilderPlaceByDomain } from '../../modules/BuilderPlace/actions/builderPlace';
import { UserProvider } from '../../modules/BuilderPlace/context/UserContext';
import { XmtpContextProvider } from '../../modules/Messaging/context/XmtpContext';
import { MessagingProvider } from '../../modules/Messaging/context/messging';
import { BuilderPlaceProvider } from '../../modules/BuilderPlace/context/BuilderPlaceContext';

async function getBuilderPlace(domain: string) {
  const builderPlace = await getBuilderPlaceByDomain(decodeURIComponent(domain));
  return builderPlace;
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { domain: string };
}) {
  const builderPlace = await getBuilderPlace(params.domain);

  return (
    <UserProvider>
      <TalentLayerProvider>
        <BuilderPlaceProvider data={builderPlace}>
          <CustomPalette customPalette={builderPlace.palette} />
          <XmtpContextProvider>
            <MessagingProvider>
              <PlatformLayout>{children}</PlatformLayout>
            </MessagingProvider>
          </XmtpContextProvider>
        </BuilderPlaceProvider>
      </TalentLayerProvider>
    </UserProvider>
  );
}
