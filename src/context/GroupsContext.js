import { createContext, useContext, useEffect } from 'react';
import { useReduxGroups } from '../hooks/useReduxGroups';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';

const GroupsContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (!context) {
    throw new Error('useGroups debe usarse dentro de GroupsProvider');
  }
  return context;
};

export const GroupsProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const reduxGroups = useReduxGroups();

  // Auto-load groups when user changes
  useEffect(() => {
    if (user) {
      reduxGroups.loadGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    ...reduxGroups
  };

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
};
