
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Cliente, Divida } from '@/types';
import { formatarMoeda, formatarData } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Loader2 } from 'lucide-react';

// Schema de validação para o formulário
const whatsAppSchema = z.object({
  numeroWhatsApp: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
    message: 'Formato inválido. Use (00) 00000-0000'
  }),
  mensagem: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres' })
});

type WhatsAppFormValues = z.infer<typeof whatsAppSchema>;

interface WhatsAppFormProps {
  cliente: Cliente;
  divida?: Divida;
  onEnviar: (numeroWhatsApp: string, mensagem: string) => void;
  onCancel: () => void;
}

const WhatsAppForm = ({ cliente, divida, onEnviar, onCancel }: WhatsAppFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if WhatsApp API is properly configured
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
    
    setApiConfigured(
      !!apiUrl && 
      !!apiKey && 
      apiUrl !== 'https://api.whatsapp.com/send'
    );
  }, []);

  // Formatação do telefone
  const formatarTelefone = (value: string) => {
    const telefoneLimpo = value.replace(/\D/g, '');
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Mensagem padrão
  const mensagemPadrao = divida 
    ? `Olá ${cliente.nome}, gostaríamos de lembrar sobre sua dívida no valor de ${formatarMoeda(divida.valor)} com vencimento em ${formatarData(divida.dataVencimento)}. Por favor, entre em contato para regularizar sua situação.`
    : `Olá ${cliente.nome}, gostaríamos de lembrar sobre suas dívidas pendentes. Por favor, entre em contato para regularizar sua situação.`;

  // Inicialização do formulário
  const form = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsAppSchema),
    defaultValues: {
      numeroWhatsApp: cliente.telefone,
      mensagem: mensagemPadrao
    }
  });

  // Função de submissão do formulário
  const handleSubmit = async (data: WhatsAppFormValues) => {
    setIsSubmitting(true);
    try {
      onEnviar(data.numeroWhatsApp, data.mensagem);
      if (apiConfigured) {
        toast({
          title: "Mensagem enviada via Evolution API",
          description: "A mensagem de cobrança foi enviada com sucesso",
        });
      } else {
        toast({
          title: "Mensagem simulada",
          description: "A Evolution API não está configurada. A mensagem foi apenas simulada.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar a mensagem de cobrança",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!apiConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Modo de simulação ativo. Configure a Evolution API para envios reais.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="numeroWhatsApp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número WhatsApp</FormLabel>
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
              <FormDescription>
                Número para envio da mensagem de cobrança
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Mensagem de cobrança"
                  className="resize-none min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A mensagem deve ser clara e respeitosa
              </FormDescription>
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
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WhatsAppForm;
