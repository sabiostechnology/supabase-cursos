"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import './reset-password.css';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface AuthError {
  message: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          router.push('/login');
          return;
        }
        setEmail(session.user.email);
      } catch (error) {
        console.error('Erro ao recuperar a sessão:', error);
        router.push('/login');
      }
    };

    fetchSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw new Error(error.message);
      }

      setMessage('Senha atualizada com sucesso!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message || 'Erro ao atualizar senha');
      } else {
        setMessage('Erro desconhecido ao atualizar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>Redefinir Senha</h2>
        <p className="email-info">Email: {email}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
