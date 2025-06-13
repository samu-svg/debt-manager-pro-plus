
import React from 'react';
import { Users, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useClientesLocal } from '@/hooks/use-clientes-local';
import { useDividasLocal } from '@/hooks/use-dividas-local';
import { formatarMoeda } from '@/lib/utils';

const Dashboard = () => {
  const { clientes } = useClientesLocal();
  const { dividas } = useDividasLocal();

  // Calcular métricas
  const totalClientes = clientes.length;
  const totalDividas = dividas.length;
  const dividasVencidas = dividas.filter(d => d.status === 'vencido').length;
  const dividasPendentes = dividas.filter(d => d.status === 'pendente').length;
  
  const valorTotal = dividas.reduce((total, divida) => total + divida.valorAtualizado, 0);
  const valorVencido = dividas
    .filter(d => d.status === 'vencido')
    .reduce((total, divida) => total + divida.valorAtualizado, 0);
  const valorPendente = dividas
    .filter(d => d.status === 'pendente')
    .reduce((total, divida) => total + divida.valor, 0);

  const inadimplentes = clientes.filter(cliente => {
    const dividasCliente = dividas.filter(d => d.clienteId === cliente.id);
    return dividasCliente.some(d => d.status === 'vencido');
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total de Clientes"
          value={totalClientes.toString()}
          description="Clientes cadastrados"
          icon={<Users className="h-6 w-6 text-blue-600" />}
        />
        
        <DashboardCard
          title="Total de Dívidas"
          value={totalDividas.toString()}
          description="Dívidas registradas"
          icon={<CreditCard className="h-6 w-6 text-green-600" />}
        />
        
        <DashboardCard
          title="Dívidas Vencidas"
          value={dividasVencidas.toString()}
          description="Requerem atenção"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          className={dividasVencidas > 0 ? "border-red-200 bg-red-50" : ""}
        />
        
        <DashboardCard
          title="Inadimplentes"
          value={inadimplentes.toString()}
          description="Clientes em atraso"
          icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
          className={inadimplentes > 0 ? "border-orange-200 bg-orange-50" : ""}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Valor Total"
          value={formatarMoeda(valorTotal)}
          description="Soma de todas as dívidas"
          icon={<CreditCard className="h-6 w-6 text-blue-600" />}
        />
        
        <DashboardCard
          title="Valor Vencido"
          value={formatarMoeda(valorVencido)}
          description="Com juros aplicados"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          className={valorVencido > 0 ? "border-red-200 bg-red-50" : ""}
        />
        
        <DashboardCard
          title="Valor Pendente"
          value={formatarMoeda(valorPendente)}
          description="Aguardando vencimento"
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
        />
      </div>

      {dividasVencidas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Atenção: {dividasVencidas} dívida{dividasVencidas > 1 ? 's' : ''} vencida{dividasVencidas > 1 ? 's' : ''}
            </h3>
          </div>
          <p className="text-red-700 mt-1">
            Valor total em atraso: {formatarMoeda(valorVencido)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
