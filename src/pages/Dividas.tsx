
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Calendar, User } from 'lucide-react';
import { useDividasLocal } from '@/hooks/use-dividas-local';
import { useClientesLocal } from '@/hooks/use-clientes-local';
import { formatarMoeda, formatarData } from '@/lib/utils';

const Dividas = () => {
  const { dividas, loading, error } = useDividasLocal();
  const { clientes } = useClientesLocal();

  // Filtrar dívidas por status
  const dividasPendentes = dividas.filter(d => d.status === 'pendente');
  const dividasVencidas = dividas.filter(d => d.status === 'vencido');
  const dividasPagas = dividas.filter(d => d.status === 'pago');

  // Calcular totais
  const totalPendente = dividasPendentes.reduce((acc, d) => acc + d.valorAtualizado, 0);
  const totalVencido = dividasVencidas.reduce((acc, d) => acc + d.valorAtualizado, 0);
  const totalPago = dividasPagas.reduce((acc, d) => acc + d.valor, 0);

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dívidas</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dívidas</h1>
          <p className="text-gray-600">Gerencie todas as dívidas dos seus clientes</p>
        </div>
        
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Dívida
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">
              {dividasPendentes.length} dívida(s)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalVencido)}</div>
            <p className="text-xs text-muted-foreground">
              {dividasVencidas.length} dívida(s)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalPago)}</div>
            <p className="text-xs text-muted-foreground">
              {dividasPagas.length} dívida(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs das Dívidas */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">
            Pendentes ({dividasPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="vencidas">
            Vencidas ({dividasVencidas.length})
          </TabsTrigger>
          <TabsTrigger value="pagas">
            Pagas ({dividasPagas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <div className="grid gap-4">
            {dividasPendentes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhuma dívida pendente
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Todas as dívidas estão em dia ou já foram pagas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              dividasPendentes.map((divida) => (
                <Card key={divida.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{divida.descricao}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {getClienteNome(divida.clienteId)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor:</span>
                        <span className="font-semibold">{formatarMoeda(divida.valorAtualizado)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span>{formatarData(divida.dataVencimento)}</span>
                      </div>
                      {divida.valorAtualizado > divida.valor && (
                        <div className="flex justify-between text-red-600">
                          <span className="text-sm">Juros acumulados:</span>
                          <span className="font-semibold">
                            {formatarMoeda(divida.valorAtualizado - divida.valor)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="vencidas">
          <div className="grid gap-4">
            {dividasVencidas.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhuma dívida vencida
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Excelente!Todas as dívidas estão em dia.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              dividasVencidas.map((divida) => (
                <Card key={divida.id} className="border-red-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{divida.descricao}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {getClienteNome(divida.clienteId)}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">Vencida</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor:</span>
                        <span className="font-semibold text-red-600">{formatarMoeda(divida.valorAtualizado)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span className="text-red-600">{formatarData(divida.dataVencimento)}</span>
                      </div>
                      {divida.valorAtualizado > divida.valor && (
                        <div className="flex justify-between text-red-600">
                          <span className="text-sm">Juros acumulados:</span>
                          <span className="font-semibold">
                            {formatarMoeda(divida.valorAtualizado - divida.valor)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pagas">
          <div className="grid gap-4">
            {dividasPagas.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhuma dívida paga
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      As dívidas pagas aparecerão aqui.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              dividasPagas.map((divida) => (
                <Card key={divida.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{divida.descricao}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          {getClienteNome(divida.clienteId)}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Paga</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor:</span>
                        <span className="font-semibold text-green-600">{formatarMoeda(divida.valor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Vencimento:</span>
                        <span>{formatarData(divida.dataVencimento)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dividas;
