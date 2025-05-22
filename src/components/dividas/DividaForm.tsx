
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cliente, Divida, MesInicioJuros } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Schema de validação para o formulário
const dividaSchema = z.object({
  clienteId: z.string(),
  valor: z.number().positive({ message: 'Valor deve ser maior que zero' }),
  dataCompra: z.date(),
  dataVencimento: z.date(),
  descricao: z.string().min(3, { message: 'Descrição deve ter pelo menos 3 caracteres' }),
  taxaJuros: z.number().min(0.01, { message: 'Taxa deve ser maior que 0,01%' }).max(100, { message: 'Taxa deve ser menor que 100%' }).default(3),
  mesInicioJuros: z.enum(['1º mês', '2º mês', '3º mês', '4º mês', '5º mês', '6º mês']).default('2º mês')
});

type DividaFormValues = z.infer<typeof dividaSchema>;

interface DividaFormProps {
  divida?: Divida;
  cliente: Cliente;
  onSubmit: (data: Omit<Divida, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const DividaForm = ({ divida, cliente, onSubmit, onCancel }: DividaFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicialização do formulário
  const form = useForm<DividaFormValues>({
    resolver: zodResolver(dividaSchema),
    defaultValues: {
      clienteId: cliente.id,
      valor: divida?.valor || 0,
      dataCompra: divida ? new Date(divida.dataCompra) : new Date(),
      dataVencimento: divida ? new Date(divida.dataVencimento) : new Date(),
      descricao: divida?.descricao || '',
      taxaJuros: divida?.taxaJuros || 3,
      mesInicioJuros: divida?.mesInicioJuros || '2º mês'
    }
  });

  // Função de submissão do formulário
  const handleSubmit = async (data: DividaFormValues) => {
    setIsSubmitting(true);
    try {
      // Verificar se a data de vencimento é posterior à data atual
      const hoje = new Date();
      const status = data.dataVencimento < hoje ? 'atrasado' : 'pendente';

      await onSubmit({
        clienteId: data.clienteId,
        valor: data.valor,
        dataCompra: data.dataCompra.toISOString(),
        dataVencimento: data.dataVencimento.toISOString(),
        descricao: data.descricao,
        taxaJuros: data.taxaJuros,
        mesInicioJuros: data.mesInicioJuros,
        status
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  placeholder="0,00" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxaJuros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Juros (%)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0.01"
                    max="100"
                    placeholder="3.0" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  <span className="absolute right-3 top-2 text-muted-foreground">% ao mês</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mesInicioJuros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cobrar juros a partir do:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês inicial" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1º mês">1º mês</SelectItem>
                  <SelectItem value="2º mês">2º mês</SelectItem>
                  <SelectItem value="3º mês">3º mês</SelectItem>
                  <SelectItem value="4º mês">4º mês</SelectItem>
                  <SelectItem value="5º mês">5º mês</SelectItem>
                  <SelectItem value="6º mês">6º mês</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataCompra"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da compra</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataVencimento"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição da dívida"
                  className="resize-none"
                  {...field}
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
            {divida ? 'Atualizar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DividaForm;
