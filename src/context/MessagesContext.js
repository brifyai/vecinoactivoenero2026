import { createContext, useContext } from 'react';
import { useReduxMessages } from '../hooks/useReduxMessages';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

/**
 * MessagesProvider - Wrapper delgado sobre Redux
 * Mantiene compatibilidad con código existente mientras usa Redux internamente
 */
export const MessagesProvider = ({ children }) => {
  const messagesData = useReduxMessages();

  return (
    <MessagesContext.Provider value={messagesData}>
      {children}
    </MessagesContext.Provider>
  );
};
