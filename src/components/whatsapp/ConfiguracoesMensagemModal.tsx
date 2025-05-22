
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Schema para validação do formulário
const configuracaoSchema = z.object({
  templateMensagem: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres' }),
  horarioEnvio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido' }),
  limiteDiario: z.number().int().min(1, { message: 'O limite deve ser pelo menos 1' }).max(100, { message: 'O limite não pode exceder 100' }),
  diasSemana: z.array(z.number()).min(1, { message: 'Selecione pelo menos um dia da semana' }),
});

type ConfiguracaoMensagemValues = z.infer<typeof configuracaoSchema>;

interface ConfiguracoesMensagemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConfiguracaoMensagemValues) => void;
  configuracoesAtuais?: ConfiguracaoMensagemValues;
}

const diasSemanaOpcoes = [
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

const ConfiguracoesMensagemModal = ({ isOpen, onClose, onSave, configuracoesAtuais }: ConfiguracoesMensagemModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Template padrão da mensagem
  const templatePadrao = "Olá {NOME}, sua dívida de R$ {VALOR_ORIGINAL} venceu há {MESES_ATRASO} meses. Valor atualizado: R$ {VALOR_CORRIGIDO}. Entre em contato para quitação.";

  // Inicializar formulário com valores padrão ou configurações atuais
  const form = useForm<ConfiguracaoMensagemValues>({
    resolver: zodResolver(configuracaoSchema),
    defaultValues: configuracoesAtuais || {
      templateMensagem: templatePadrao,
      horarioEnvio: "09:00",
      limiteDiario: 50,
      diasSemana: [1, 2, 3, 4, 5, 6], // Segunda a Sábado por padrão
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
      onSave(data);
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
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => inserirVariavel("{NOME}")}>
                          {NOME}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => inserirVariavel("{VALOR_ORIGINAL}")}>
                          {VALOR_ORIGINAL}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => inserirVariavel("{MESES_ATRASO}")}>
                          {MESES_ATRASO}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => inserirVariavel("{VALOR_CORRIGIDO}")}>
                          {VALOR_CORRIGIDO}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => inserirVariavel("{DATA_VENCIMENTO}")}>
                          {DATA_VENCIMENTO}
                        </Button>
                      </div>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {diasSemanaOpcoes.map((dia) => (
                      <FormField
                        key={dia.id}
                        control={form.control}
                        name="diasSemana"
                        render={({ field }) => {
                          return (
                            <FormItem key={dia.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dia.id)}
                                  onCheckedChange={(checked) => {
                                    const currentValues = [...field.value];
                                    if (checked) {
                                      field.onChange([...currentValues, dia.id]);
                                    } else {
                                      field.onChange(currentValues.filter((value) => value !== dia.id));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {dia.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
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
