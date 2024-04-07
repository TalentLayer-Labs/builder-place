import CustomPalette from '../../../components/CustomPalette';
import { TalentLayerProvider } from '../../../context/talentLayer';
import { UserProvider } from '../../../modules/BuilderPlace/context/UserContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TalentLayerProvider>
        <CustomPalette />
        <div className='mt-[90px]'>{children}</div>
      </TalentLayerProvider>
    </UserProvider>
  );
}
