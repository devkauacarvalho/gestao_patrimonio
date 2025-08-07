import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { IconLogin } from '../../constants.tsx';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  errorMessage: string | null;
  clearError: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, errorMessage, clearError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); 
    setIsSubmitting(true);
    const success = await onLogin(username, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/'); 
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <Card title="Acesso ao Sistema">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{errorMessage}</span>
            <button onClick={clearError} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500">X</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuário (padrão: admin)"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Senha (padrão: admin)"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <Button type="submit" fullWidth disabled={isSubmitting}>
            <IconLogin className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginScreen;