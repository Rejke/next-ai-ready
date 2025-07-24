import { useState } from 'react';
import { signIn } from '@/shared/lib/auth-client';
import { Button } from '@/shared/ui/button';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn.email({
        email,
        password,
      });
      // Redirect will be handled by auth client
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block font-medium text-sm" htmlFor="email">
          Email
        </label>
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          id="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="block font-medium text-sm" htmlFor="password">
          Password
        </label>
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          id="password"
          onChange={(e) => setPassword(e.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
