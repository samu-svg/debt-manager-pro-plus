
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { TipoJuros } from '@/types';
import { formatarMoeda } from '@/lib/utils';
import { useCalculadora } from '@/hooks/use-calculadora';

// Schema de validação para o formulário
const calculadoraSchema = z.object({
  valorInicial: z.number().positive({ message: 'Valor deve ser maior que zero' }),
  meses: z.number().int().positive({ message: 'Meses deve ser um número inteiro positivo' }),
  tipo: z.enum(['simples', 'composto']),
  taxa: z.number().min(0.01, { message: 'Taxa deve ser maior que 0.01%' }).max(100, { message: 'Taxa não pode ser maior que 100%' })
});

type CalculadoraFormValues = z.infer<typeof calculadoraSchema>;

const CalculadoraJuros = () => {
  const { resultado, calculando, calcularJuros, limparResultado } = useCalculadora();
  const [mostrarPassos, setMostrarPassos] = useState(false);

  // Inicialização do formulário
  const form = useForm<CalculadoraFormValues>({
    resolver: zodResolver(calculadoraSchema),
    defaultValues: {
      valorInicial: 0,
      meses: 1,
      tipo: 'composto',
      taxa: 3.0
    }
  });

  // Função de submissão do formulário
  const handleSubmit = (data: CalculadoraFormValues) => {
    calcularJuros(data.valorInicial, data.meses, data.taxa, data.tipo);
  };

  // Renderizar passos do cálculo
  const renderizarPassosCalculo = () => {
    if (!resultado) return null;

    if (resultado.tipo === 'simples') {
      return (
        <div className="space-y-2 text-sm">
          <p>1. <strong>Fórmula de juros simples:</strong> M = P × (1 + i × n)</p>
          <p>Onde:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>M = Montante final</li>
            <li>P = Principal (valor inicial)</li>
            <li>i = Taxa de juros (em decimal)</li>
            <li>n = Período em meses</li>
          </ul>
          <p>2. <strong>Substituindo os valores:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorInicial)} × (1 + {(resultado.taxa/100).toFixed(4)} × {resultado.meses})
          </p>
          <p>3. <strong>Calculando:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorInicial)} × {(1 + (resultado.taxa/100) * resultado.meses).toFixed(4)}
          </p>
          <p>4. <strong>Resultado:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorFinal)}
          </p>
        </div>
      );
    } else {
      return (
        <div className="space-y-2 text-sm">
          <p>1. <strong>Fórmula de juros compostos:</strong> M = P × (1 + i)^n</p>
          <p>Onde:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>M = Montante final</li>
            <li>P = Principal (valor inicial)</li>
            <li>i = Taxa de juros (em decimal)</li>
            <li>n = Período em meses</li>
          </ul>
          <p>2. <strong>Substituindo os valores:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorInicial)} × (1 + {(resultado.taxa/100).toFixed(4)})^{resultado.meses}
          </p>
          <p>3. <strong>Calculando:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorInicial)} × {Math.pow(1 + resultado.taxa/100, resultado.meses).toFixed(4)}
          </p>
          <p>4. <strong>Resultado:</strong></p>
          <p className="font-mono bg-gray-100 p-2 rounded">
            M = {formatarMoeda(resultado.valorFinal)}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Juros</CardTitle>
          <CardDescription>
            Calcule juros simples ou compostos para qualquer valor e período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="valorInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor inicial (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        placeholder="0,00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período (meses)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="1"
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de juros</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="simples" id="simples" />
                          <Label htmlFor="simples">Juros Simples</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="composto" id="composto" />
                          <Label htmlFor="composto">Juros Compostos</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de juros (% ao mês)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0.01"
                        max="100"
                        placeholder="3.0" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 3.0)}
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
                  onClick={() => {
                    form.reset();
                    limparResultado();
                  }}
                  disabled={calculando}
                >
                  Limpar
                </Button>
                <Button 
                  type="submit"
                  disabled={calculando}
                >
                  Calcular
                </Button>
              </div>
            </form>
          </Form>

          {resultado && (
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Resultado do cálculo</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Valor inicial:</p>
                    <p className="font-medium">{formatarMoeda(resultado.valorInicial)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Tipo de juros:</p>
                    <p className="font-medium">{resultado.tipo === 'simples' ? 'Simples' : 'Composto'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Taxa de juros:</p>
                    <p className="font-medium">{resultado.taxa}% ao mês</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Período:</p>
                    <p className="font-medium">{resultado.meses} {resultado.meses === 1 ? 'mês' : 'meses'}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor final com juros:</p>
                      <p className="text-xl font-bold text-cobalt-700">{formatarMoeda(resultado.valorFinal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total de juros:</p>
                      <p className="text-lg font-semibold text-cobalt-600">{formatarMoeda(resultado.juros)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Button
                    variant="link"
                    onClick={() => setMostrarPassos(!mostrarPassos)}
                    className="p-0 h-auto text-sm"
                  >
                    {mostrarPassos ? 'Esconder detalhes do cálculo' : 'Ver detalhes do cálculo'}
                  </Button>
                  
                  {mostrarPassos && (
                    <div className="mt-4 border rounded-md p-4">
                      {renderizarPassosCalculo()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculadoraJuros;
