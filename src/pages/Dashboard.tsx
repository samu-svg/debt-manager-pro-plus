
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useClientes } from '@/hooks/use-clientes';
import { useDividas } from '@/hooks/use-dividas';
import { formatarMoeda } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { clientes } = useClientes();
  const { dividas } = useDividas();
  const [activeTab, setActiveTab] = useState('geral');
  
  // Métricas principais
  const totalClientes = clientes.length;
  const totalDividas = dividas.length;
  const totalValorDividas = dividas.reduce((sum, divida) => sum + divida.valor, 0);
  const dividasAtrasadas = dividas.filter(divida => divida.status === 'atrasado');
  const dividasPendentes = dividas.filter(divida => divida.status === 'pendente');
  const dividasPagas = dividas.filter(divida => divida.status === 'pago');
  const totalValorAtrasado = dividasAtrasadas.reduce((sum, divida) => sum + divida.valor, 0);
  const totalClientesInadimplentes = new Set(dividasAtrasadas.map(divida => divida.clienteId)).size;
  
  // Dados para gráficos
  const statusData = [
    { name: 'Atrasadas', value: dividasAtrasadas.length, cor: '#EF4444' },
    { name: 'Pendentes', value: dividasPendentes.length, cor: '#3B82F6' },
    { name: 'Pagas', value: dividasPagas.length, cor: '#10B981' }
  ];

  // Função para formatar valores no tooltip do gráfico
  const formatarTooltipValor = (value: number) => {
    return formatarMoeda(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/clientes">
              Gerenciar Clientes
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geral" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
              title="Total de Clientes" 
              value={totalClientes.toString()}
              className="border-l-4 border-l-cobalt-500"
            />
            <DashboardCard 
              title="Total de Dívidas" 
              value={totalDividas.toString()}
              className="border-l-4 border-l-cobalt-500"
            />
            <DashboardCard 
              title="Valor Total" 
              value={formatarMoeda(totalValorDividas)}
              className="border-l-4 border-l-cobalt-500"
            />
            <DashboardCard 
              title="Clientes Inadimplentes" 
              value={totalClientesInadimplentes.toString()}
              className="border-l-4 border-l-danger-500"
              description={`${Math.round((totalClientesInadimplentes / totalClientes) * 100)}% do total`}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visão Geral de Dívidas</CardTitle>
                <CardDescription>
                  Distribuição de dívidas por status
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.cor} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} dívidas`, 'Quantidade']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dívidas Atrasadas</CardTitle>
                <CardDescription>
                  Total: {formatarMoeda(totalValorAtrasado)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-4">
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span className="font-medium">{dividasAtrasadas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>% do total de dívidas:</span>
                    <span className="font-medium">
                      {totalDividas > 0 ? Math.round((dividasAtrasadas.length / totalDividas) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>% do valor total:</span>
                    <span className="font-medium">
                      {totalValorDividas > 0 ? Math.round((totalValorAtrasado / totalValorDividas) * 100) : 0}%
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t">
                    <Button variant="default" className="w-full" asChild>
                      <Link to="/dividas">
                        Ver dívidas atrasadas
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="dividas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
              title="Dívidas Atrasadas" 
              value={dividasAtrasadas.length.toString()}
              className="border-l-4 border-l-danger-500"
              description={formatarMoeda(totalValorAtrasado)}
            />
            <DashboardCard 
              title="Dívidas Pendentes" 
              value={dividasPendentes.length.toString()}
              className="border-l-4 border-l-yellow-500"
              description={formatarMoeda(dividasPendentes.reduce((sum, divida) => sum + divida.valor, 0))}
            />
            <DashboardCard 
              title="Dívidas Pagas" 
              value={dividasPagas.length.toString()}
              className="border-l-4 border-l-green-500"
              description={formatarMoeda(dividasPagas.reduce((sum, divida) => sum + divida.valor, 0))}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Valor</CardTitle>
              <CardDescription>
                Comparativo de valores por status
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Atrasadas',
                        valor: dividasAtrasadas.reduce((sum, divida) => sum + divida.valor, 0)
                      },
                      {
                        name: 'Pendentes',
                        valor: dividasPendentes.reduce((sum, divida) => sum + divida.valor, 0)
                      },
                      {
                        name: 'Pagas',
                        valor: dividasPagas.reduce((sum, divida) => sum + divida.valor, 0)
                      }
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatarTooltipValor} />
                    <Tooltip formatter={formatarTooltipValor} />
                    <Bar dataKey="valor" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clientes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardCard 
              title="Total de Clientes" 
              value={totalClientes.toString()}
              className="border-l-4 border-l-cobalt-500"
            />
            <DashboardCard 
              title="Clientes Inadimplentes" 
              value={totalClientesInadimplentes.toString()}
              className="border-l-4 border-l-danger-500"
              description={`${Math.round((totalClientesInadimplentes / totalClientes) * 100)}% do total`}
            />
            <DashboardCard 
              title="Média de Dívidas" 
              value={(totalClientes ? (totalDividas / totalClientes).toFixed(1) : "0")}
              className="border-l-4 border-l-cobalt-500"
              description="Dívidas por cliente"
            />
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Clientes Recentes</CardTitle>
                <CardDescription>
                  Últimos clientes cadastrados
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/clientes">
                  Ver todos
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientes.slice(0, 5).map((cliente) => {
                  const clienteDividas = dividas.filter(d => d.clienteId === cliente.id);
                  const temDividaAtrasada = clienteDividas.some(d => d.status === 'atrasado');
                  
                  return (
                    <div key={cliente.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.telefone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {temDividaAtrasada && (
                          <div className="text-xs bg-danger-50 text-danger-600 px-2 py-1 rounded">
                            Inadimplente
                          </div>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/clientes/${cliente.id}`}>
                            Detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
