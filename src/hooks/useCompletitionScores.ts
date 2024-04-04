import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import { getCompletionScores } from '../utils/profile';

export const useCompletitionScores = () => {
  const { user: talentLayerUser } = useContext(TalentLayerContext);

  if (!talentLayerUser) return null;

  const completionScores = getCompletionScores(talentLayerUser);

  return completionScores;
};
