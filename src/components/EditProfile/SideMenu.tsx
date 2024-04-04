import { useCompletitionScores } from '../../hooks/useCompletitionScores';
import { ICompletionScores } from '../../utils/profile';
import SideLink from './SideLink';
import { navigation } from './navigation';

function SideMenu() {
  const completionScores = useCompletitionScores();

  return (
    <ul className='space-y-1 font-sans text-sm'>
      {navigation().map(item => (
        <SideLink
          key={item.name}
          href={item.href}
          isCompleted={
            completionScores &&
            completionScores[item.completitonKey as keyof ICompletionScores]?.percentage == 100
              ? true
              : false
          }>
          <item.icon width={20} height={20} />
          <span className='grow'>{item.name}</span>
        </SideLink>
      ))}
    </ul>
  );
}

export default SideMenu;
