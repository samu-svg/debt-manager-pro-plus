
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalData } from '@/contexts/LocalDataContext';
import { formatarMoeda, formatarData } from '@/lib/utils';
import { 
  Users, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Calendar,
  CreditCard
} from 'lucide-react';

const Dashboard = () => {
  const { clientes, dividas, pagamentos } = useLocalData();

  // Calcular estatísticas
  const totalClientes = clientes.length;
  const totalDividas = dividas.length;
  const dividasPendentes = dividas.filter(d => d.status === 'pendente');
  const dividasVencidas = dividas.filter(d => d.status === 'vencido');
  const dividasPagas = dividas.filter(d => d.status === 'pago');

  const valorTotalDividas = dividas.reduce((acc, d) => acc + d.valorAtualizado, 0);
  const valorPendente = dividasPendentes.reduce((acc, d) => acc + d.valorAtualizado, 0);
  const valorVencido = dividasVencidas.reduce((acc, d) => acc + d.valorAtualizado, 0);
  const valorRecebido = dividasPagas.reduce((acc, d) => acc + d.valor, 0);

  const totalPagamentos = pagamentos.reduce((acc, p) => acc + p.valor, 0);

  // Últimas atividades (dívidas criadas recentemente)
  const ultimasDividas = [...dividas]
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu sistema de cobranças</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              clientes cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(valorTotalDividas)}</div>
            <p className="text-xs text-muted-foreground">
              em dívidas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dividasVencidas.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatarMoeda(valorVencido)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalPagamentos)}</div>
            <p className="text-xs text-muted-foreground">
              em pagamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Dívidas</CardTitle>
            <CardDescription>Status das dívidas por categoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Pendentes</Badge>
                <span className="text-sm text-muted-foreground">{dividasPendentes.length} dívidas</span>
              </div>
              <span className="font-medium">{formatarMoeda(valorPendente)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">Vencidas</Badge>
                <span className="text-sm text-muted-foreground">{dividasVencidas.length} dívidas</span>
              </div>
              <span className="font-medium text-red-600">{formatarMoeda(valorVencido)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">Pagas</Badge>
                <span className="text-sm text-muted-foreground">{dividasPagas.length} dívidas</span>
              </div>
              <span className="font-medium text-green-600">{formatarMoeda(valorRecebido)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Dívidas</CardTitle>
            <CardDescription>Dívidas registradas recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            {ultimasDividas.length > 0 ? (
              <div className="space-y-3">
                {ultimasDividas.map((divida) => {
                  const cliente = clientes.find(c => c.id === divida.clienteId);
                  return (
                    <div key={divida.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cliente?.nome || 'Cliente não encontrado'}</p>
                        <p className="text-xs text-muted-foreground">{divida.descricao}</p>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Vence: {formatarData(divida.dataVencimento)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{formatarMoeda(divida.valorAtualizado)}</p>
                        <Badge 
                          variant={
                            divida.status === 'pago' ? 'outline' : 
                            divida.status === 'vencido' ? 'destructive' : 'secondary'
                          }
                          className={divida.status === 'pago' ? 'text-green-600 border-green-600' : ''}
                        >
                          {divida.status === 'pago' ? 'Pago' : 
                           divida.status === 'vencido' ? 'Vencido' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma dívida registrada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
