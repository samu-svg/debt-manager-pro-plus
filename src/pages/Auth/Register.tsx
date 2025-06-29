import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não correspondem');
      toast({
        title: 'Senhas não correspondem',
        description: 'A senha e a confirmação de senha devem ser iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve ter pelo menos 8 caracteres');
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!organizationName.trim()) {
      setErrorMessage('O nome da organização é obrigatório');
      toast({
        title: 'Erro de validação',
        description: 'Informe o nome da sua empresa/organização.',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Enviando solicitação de registro...');
      const { error } = await signUp(email, password);
      
      if (error) {
        console.error('Erro retornado:', error);
        let errorMsg = 'Verifique os dados e tente novamente.';
        
        // Tratamento específico para erros comuns
        if (error.message?.includes('email')) {
          errorMsg = 'Este email já está sendo usado ou é inválido.';
        } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
          errorMsg = 'Erro de permissão. Contate o administrador do sistema.';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
        toast({
          title: 'Erro ao registrar',
          description: errorMsg,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Registro realizado com sucesso!',
          description: 'Verifique seu email para confirmar sua conta.',
        });
        navigate('/auth/login');
      }
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      const errorMsg = error?.message || 'Ocorreu um erro ao tentar registrar sua conta.';
      setErrorMessage(errorMsg);
      toast({
        title: 'Erro inesperado',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
          <CardDescription>
            Registre-se para acessar o sistema de gerenciamento de cobranças
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-start">
              <AlertTriangle className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Nome da Empresa <span className="text-destructive">*</span>
              </label>
              <Input
                id="organization"
                type="text"
                placeholder="Sua Empresa Ltda"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                className={organizationName.trim() === '' && errorMessage ? 'border-destructive' : ''}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={password.length < 8 && errorMessage ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Senha <span className="text-destructive">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={password !== confirmPassword && errorMessage ? 'border-destructive' : ''}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t p-6">
          <div className="text-center text-sm">
            Já tem uma conta?{' '}
            <Link to="/auth/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
