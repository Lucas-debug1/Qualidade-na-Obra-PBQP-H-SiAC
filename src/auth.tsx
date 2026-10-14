import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LockKeyhole, LogIn } from 'lucide-react';
import { supabase } from './lib/supabase';

export type Role = 'inspetor' | 'mestre_obras' | 'engenheiro';
type AuthValue = { session: Session; role: Role; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthGate');
  return value;
};

export function canEdit(role: Role, userId: string | undefined, recordUserId: unknown) { /** Um usuário pode editar/excluir um registro se for dono dele OU se for engenheiro. */
  return role === 'engenheiro' || (!!userId && recordUserId === userId);
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>('inspetor');
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadRole = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', uid).single();
    setRole((data?.role as Role) ?? 'inspetor');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadRole(data.session.user.id);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) loadRole(next.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou senha inválidos.');
    setBusy(false);
  };

  if (checking) return <div className="auth-loading">Verificando acesso...</div>;
  if (!session) return <main className="auth-page"><section className="auth-brand"><div className="auth-logo">Q</div><small>PBQP-H • SiAC</small><h1>Qualidade na Obra</h1><p>Inspeções, evidências e controles da qualidade em um ambiente seguro para sua equipe.</p><ul><li>Registros associados ao colaborador</li><li>Fotos e evidências da inspeção</li><li>FVS prontas para impressão e PDF</li></ul></section><section className="auth-card"><LockKeyhole size={30}/><div><small>ACESSO RESTRITO</small><h2>Entrar na plataforma</h2></div><form onSubmit={submit}><label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Senha<input type="password" minLength={6} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="auth-error">{error}</p>}<button className="primary" disabled={busy}><LogIn size={17}/> {busy ? 'Aguarde...' : 'Entrar'}</button></form><p className="auth-hint">Seu acesso é criado pelo engenheiro responsável. Em caso de dúvida, procure a gestão da obra.</p></section></main>;
  return <AuthContext.Provider value={{ session, role, signOut: async () => { await supabase.auth.signOut(); } }}>{children}</AuthContext.Provider>;
}