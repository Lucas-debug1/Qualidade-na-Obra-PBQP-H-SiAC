import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { supabase } from './lib/supabase';

type AuthValue = { session: Session; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthGate');
  return value;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) setError(error.message); else setMessage('Cadastro criado. Confirme o e-mail, se solicitado, e entre na plataforma.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('E-mail ou senha inválidos.');
    }
    setBusy(false);
  };

  if (checking) return <div className="auth-loading">Verificando acesso...</div>;
  if (!session) return <main className="auth-page"><section className="auth-brand"><div className="auth-logo">Q</div><small>PBQP-H • SiAC</small><h1>Qualidade na Obra</h1><p>Inspeções, evidências e controles da qualidade em um ambiente seguro para sua equipe.</p><ul><li>Registros associados ao colaborador</li><li>Fotos e evidências da inspeção</li><li>FVS prontas para impressão e PDF</li></ul></section><section className="auth-card"><LockKeyhole size={30}/><div><small>ACESSO RESTRITO</small><h2>{mode === 'login' ? 'Entrar na plataforma' : 'Criar acesso'}</h2></div><form onSubmit={submit}>{mode === 'signup' && <label>Nome completo<input required value={name} onChange={e => setName(e.target.value)} /></label>}<label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Senha<input type="password" minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p className="auth-error">{error}</p>}{message && <p className="auth-message">{message}</p>}<button className="primary" disabled={busy}>{mode === 'login' ? <LogIn size={17}/> : <UserPlus size={17}/>} {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</button></form><button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}>{mode === 'login' ? 'Primeiro acesso? Criar conta' : 'Já tenho acesso'}</button></section></main>;
  return <AuthContext.Provider value={{ session, signOut: async () => { await supabase.auth.signOut(); } }}>{children}</AuthContext.Provider>;
}
