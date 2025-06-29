
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ClienteLocal } from '@/types/localStorage';

// Schema de validação para o formulário
const clienteSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }).max(14),
  telefone: z.string().min(10, { message: 'Telefone inválido' }).max(15)
});

type ClienteFormValues = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: ClienteLocal | null;
  onSave: (data: Omit<ClienteLocal, 'id' | 'dividas' | 'pagamentos'>) => Promise<void>;
  onCancel: () => void;
}

const ClienteForm = ({ cliente, onSave, onCancel }: ClienteFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formatar CPF ao digitar
  const formatarCPF = (value: string) => {
    const cpfLimpo = value.replace(/\D/g, '');
    if (cpfLimpo.length <= 11) {
      return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Formatar telefone ao digitar
  const formatarTelefone = (value: string) => {
    const telefoneLimpo = value.replace(/\D/g, '');
    if (telefoneLimpo.length <= 10) {
      return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  console.log("Cliente recebido no formulário:", cliente);

  // Inicialização do formulário
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: cliente?.nome || '',
      cpf: cliente?.cpf || '',
      telefone: cliente?.telefone || ''
    }
  });

  // Função de submissão do formulário
  const handleSubmit = async (data: ClienteFormValues) => {
    console.log("Dados do formulário antes do envio:", data);
    setIsSubmitting(true);
    try {
      // Formatar os dados antes de enviar
      const cpfFormatado = formatarCPF(data.cpf);
      const telefoneFormatado = formatarTelefone(data.telefone);

      const dadosFormatados = {
        nome: data.nome, // Ensure nome is always included
        cpf: cpfFormatado,
        telefone: telefoneFormatado,
        email: cliente?.email || '',
        endereco: cliente?.endereco || '',
        createdAt: cliente?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log("Dados formatados para envio:", dadosFormatados);
      await onSave(dadosFormatados);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input 
                  placeholder="000.000.000-00" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      field.onChange(formatarCPF(value));
                    }
                  }}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(00) 00000-0000" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) {
                      field.onChange(formatarTelefone(value));
                    }
                  }}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {cliente ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClienteForm;
