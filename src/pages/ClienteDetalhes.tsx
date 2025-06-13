
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { useClientesLocal } from '@/hooks/use-clientes-local';
import { useDividasLocal } from '@/hooks/use-dividas-local';
import { formatarMoeda, formatarTelefone, formatarData } from '@/lib/utils';
import { ClienteLocal } from '@/types/localStorage';

const ClienteDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<ClienteLocal | null>(null);
  
  const { obterClientePorId } = useClientesLocal();
  const { obterDividasPorCliente } = useDividasLocal();

  useEffect(() => {
    if (id) {
      const clienteEncontrado = obterClientePorId(id);
      setCliente(clienteEncontrado);
    }
  }, [id, obterClientePorId]);

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente não encontrado</h2>
          <p className="text-gray-600 mb-4">O cliente que você está procurando não existe.</p>
          <Button onClick={() => navigate('/clientes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  const dividasCliente = obterDividasPorCliente(cliente.id);
  const totalDividas = dividasCliente.reduce((total, divida) => total + divida.valorAtualizado, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cliente.nome}</h1>
            <p className="text-gray-600">Detalhes do cliente</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">CPF</p>
                  <p className="font-medium">{cliente.cpf}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{formatarTelefone(cliente.telefone)}</p>
                </div>
              </div>
              
              {cliente.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{cliente.email}</p>
                  </div>
                </div>
              )}
              
              {cliente.endereco && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium">{cliente.endereco}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cadastrado em</p>
                  <p className="font-medium">{formatarData(cliente.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Resumo Financeiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de dívidas:</span>
                <span className="text-2xl font-bold">{formatarMoeda(totalDividas)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Número de dívidas:</span>
                <span className="font-semibold">{dividasCliente.length}</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Status das dívidas:</p>
                <div className="flex flex-wrap gap-2">
                  {dividasCliente.length === 0 ? (
                    <Badge variant="secondary">Sem dívidas</Badge>
                  ) : (
                    <>
                      {dividasCliente.some(d => d.status === 'vencido') && (
                        <Badge variant="destructive">Vencidas</Badge>
                      )}
                      {dividasCliente.some(d => d.status === 'pendente') && (
                        <Badge variant="outline">Pendentes</Badge>
                      )}
                      {dividasCliente.some(d => d.status === 'pago') && (
                        <Badge variant="default">Pagas</Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dívidas */}
      {dividasCliente.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dívidas</CardTitle>
            <CardDescription>
              Lista de todas as dívidas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dividasCliente.map((divida) => (
                <div key={divida.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{divida.descricao}</h4>
                      <p className="text-sm text-gray-500">
                        Vencimento: {formatarData(divida.dataVencimento)}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        divida.status === 'pago' ? 'default' :
                        divida.status === 'vencido' ? 'destructive' : 'outline'
                      }
                    >
                      {divida.status.charAt(0).toUpperCase() + divida.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Valor original: {formatarMoeda(divida.valor)}
                    </div>
                    <div className="text-lg font-semibold">
                      {formatarMoeda(divida.valorAtualizado)}
                    </div>
                  </div>
                  
                  {divida.valorAtualizado > divida.valor && (
                    <div className="text-sm text-red-600 mt-1">
                      Juros: {formatarMoeda(divida.valorAtualizado - divida.valor)} ({divida.juros}% a.m.)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClienteDetalhes;
