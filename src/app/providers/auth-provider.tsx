import { createContext, type ReactNode, useContext } from 'react';
import { useSession } from '@/shared/lib/auth-client';

// Get Session type from the auth client hook
type Session = NonNullable<ReturnType<typeof useSession>['data']>;

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: loading, error } = useSession();

  return (
    <AuthContext.Provider value={{ session, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
