import CustomPalette from '../../components/CustomPalette';
import { TalentLayerProvider } from '../../context/talentLayer';
import { BuilderPlaceProvider } from '../../modules/BuilderPlace/context/BuilderPlaceContext';
import { UserProvider } from '../../modules/BuilderPlace/context/UserContext';
import { getBuilderPlace } from '../../modules/BuilderPlace/queries';
import { IBuilderPlace } from '../../modules/BuilderPlace/types';
import { XmtpContextProvider } from '../../modules/Messaging/context/XmtpContext';
import { MessagingProvider } from '../../modules/Messaging/context/messging';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const projects = await getBuilderPlace();

  return (
    <UserProvider>
      <TalentLayerProvider>
        <BuilderPlaceProvider>
          <CustomPalette />
          <XmtpContextProvider>
            <MessagingProvider>
              <Layout>{children}</Layout>
            </MessagingProvider>
          </XmtpContextProvider>
        </BuilderPlaceProvider>
      </TalentLayerProvider>
    </UserProvider>
  );
}
