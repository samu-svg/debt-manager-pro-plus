
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ConfiguracaoMensagem } from '@/types/whatsapp';
import MensagemVariaveisButtons from './MensagemVariaveisButtons';
import DiasSemanaSelect from './DiasSemanaSelect';
import { TEMPLATE_PADRAO, configuracaoSchema, ConfiguracaoMensagemValues } from './configuracaoMensagemConstants';

interface ConfiguracoesMensagemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfiguracaoMensagem) => void;
  configuracaoInicial?: ConfiguracaoMensagem;
}

const ConfiguracoesMensagemModal = ({ isOpen, onClose, onSave, configuracaoInicial }: ConfiguracoesMensagemModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Inicializar formulário com valores padrão ou configurações atuais
  const form = useForm<ConfiguracaoMensagemValues>({
    resolver: zodResolver(configuracaoSchema),
    defaultValues: {
      templateMensagem: configuracaoInicial?.templateMensagem || TEMPLATE_PADRAO,
      horarioEnvio: configuracaoInicial?.horarioEnvio || "09:00",
      limiteDiario: configuracaoInicial?.limiteDiario || 50,
      diasSemana: configuracaoInicial?.diasSemana || [1, 2, 3, 4, 5, 6], // Segunda a Sábado por padrão
    }
  });

  // Função para inserir variáveis na posição do cursor
  const inserirVariavel = (variavel: string) => {
    const textarea = document.getElementById('templateMensagem') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const texto = form.getValues('templateMensagem');
      const textoAtualizado = texto.substring(0, start) + variavel + texto.substring(end);
      form.setValue('templateMensagem', textoAtualizado, { shouldValidate: true });
      
      // Reposicionar o cursor após a variável inserida
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variavel.length, start + variavel.length);
      }, 0);
    }
  };

  // Função de submissão do formulário
  const handleSubmit = async (data: ConfiguracaoMensagemValues) => {
    setIsSubmitting(true);
    try {
      // Garantir que todos os campos obrigatórios estejam presentes
      const configCompleta: ConfiguracaoMensagem = {
        templateMensagem: data.templateMensagem,
        horarioEnvio: data.horarioEnvio,
        limiteDiario: data.limiteDiario,
        diasSemana: data.diasSemana
      };
      
      onSave(configCompleta);
      toast({
        title: "Configurações salvas",
        description: "As configurações de mensagem foram atualizadas com sucesso",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configurar Mensagens Automáticas</DialogTitle>
          <DialogDescription>
            Configure o template e as regras para envio de mensagens automáticas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateMensagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template da mensagem</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Textarea 
                        id="templateMensagem"
                        placeholder="Digite o template da mensagem aqui..."
                        className="min-h-[120px]"
                        {...field}
                      />
                      <MensagemVariaveisButtons onInserirVariavel={inserirVariavel} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Use as variáveis acima para personalizar a mensagem para cada cliente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horarioEnvio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário para envio automático</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Defina o horário para envio das mensagens automáticas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="limiteDiario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite diário de mensagens</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo de mensagens que serão enviadas por dia.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="diasSemana"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Dias da semana para envio</FormLabel>
                    <FormDescription>
                      Selecione os dias em que as mensagens podem ser enviadas.
                    </FormDescription>
                  </div>
                  <DiasSemanaSelect form={form} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Salvar Configurações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracoesMensagemModal;
