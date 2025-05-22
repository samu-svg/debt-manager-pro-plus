
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalculoJuros, TipoJuros } from "@/types";
import { calcularJurosSimples, calcularJurosCompostos, formatarMoeda } from "@/lib/utils";

// Schema de validação para o formulário
const calculadoraSchema = z.object({
  valorInicial: z.number().positive({ message: "O valor deve ser maior que zero" }),
  meses: z.number().int().positive({ message: "O número de meses deve ser maior que zero" }),
  taxa: z.number().min(0.01, { message: "A taxa deve ser maior que 0.01%" }).max(100, { message: "A taxa não deve ultrapassar 100%" }),
  tipo: z.enum(["simples", "composto"], { required_error: "Selecione um tipo de juros" })
});

type FormValues = z.infer<typeof calculadoraSchema>;

const CalculadoraJuros = () => {
  const [resultado, setResultado] = useState<CalculoJuros | null>(null);
  
  // Inicialização do formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(calculadoraSchema),
    defaultValues: {
      valorInicial: 1000,
      meses: 12,
      taxa: 3,
      tipo: "composto" as TipoJuros
    }
  });
  
  const calcularJuros = (data: FormValues) => {
    const { valorInicial, meses, taxa, tipo } = data;
    let valorFinal = 0;
    
    if (tipo === "simples") {
      valorFinal = calcularJurosSimples(valorInicial, taxa, meses);
    } else {
      valorFinal = calcularJurosCompostos(valorInicial, taxa, meses);
    }
    
    const juros = valorFinal - valorInicial;
    
    setResultado({
      valorInicial,
      meses,
      taxa,
      tipo,
      valorFinal,
      juros
    });
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Juros</CardTitle>
          <CardDescription>
            Calcule juros simples ou compostos sobre um valor, com taxa e período personalizáveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calcularJuros)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
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
                          placeholder="0,00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor original da dívida
                      </FormDescription>
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
                          placeholder="12" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormDescription>
                        Quantidade de meses para o cálculo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa mensal (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="3.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentual de juros ao mês (padrão: 3%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de juros</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de juros" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simples">Juros Simples</SelectItem>
                          <SelectItem value="composto">Juros Compostos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Método de cálculo dos juros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Calcular Juros
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Cálculo</CardTitle>
            <CardDescription>
              {resultado.tipo === "simples" ? "Juros Simples" : "Juros Compostos"} - {resultado.taxa}% ao mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Valor inicial:</p>
                  <p className="text-lg font-semibold">{formatarMoeda(resultado.valorInicial)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Período:</p>
                  <p className="text-lg font-semibold">{resultado.meses} {resultado.meses === 1 ? 'mês' : 'meses'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Juros acumulados:</p>
                  <p className="text-lg font-semibold text-cobalt-600">{formatarMoeda(resultado.juros)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Valor final:</p>
                  <p className="text-xl font-bold text-cobalt-700">{formatarMoeda(resultado.valorFinal)}</p>
                </div>
              </div>
              
              {resultado.tipo === "composto" && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Cálculo passo a passo</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatarMoeda(resultado.valorInicial)} × (1 + {resultado.taxa / 100})^{resultado.meses} = {formatarMoeda(resultado.valorFinal)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalculadoraJuros;
