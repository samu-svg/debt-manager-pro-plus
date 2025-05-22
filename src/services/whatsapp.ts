
import { Cliente, Divida } from '@/types';
import { Comunicacao, StatusMensagem, construirMensagem } from '@/types/whatsapp';
import { calcularDividaCorrigida, calcularMesesAtraso } from '@/lib/utils';

// WhatsApp API config
const API_URL = import.meta.env.VITE_WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
const TOKEN = import.meta.env.VITE_WHATSAPP_TOKEN;
const PHONE_NUMBER = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER;

/**
 * Service for WhatsApp communication
 */
export const whatsAppService = {
  /**
   * Send WhatsApp message to a client about their debt
   */
  async enviarMensagem(
    cliente: Cliente, 
    divida: Divida, 
    mensagem: string,
    telefone?: string // Optional parameter to override cliente.telefone
  ): Promise<{ success: boolean; error?: string; comunicacao?: Comunicacao }> {
    try {
      // Validate phone number
      const numeroTelefone = telefone || cliente.telefone;
      if (!numeroTelefone || !this.validarNumeroTelefone(numeroTelefone)) {
        console.error('Número de telefone inválido:', numeroTelefone);
        return { success: false, error: 'Número de telefone inválido' };
      }
      
      // Format phone number (remove special chars)
      const numeroFormatado = numeroTelefone.replace(/\D/g, '');
      
      // If we're in development/test mode, log instead of actually sending
      if (!TOKEN || process.env.NODE_ENV === 'development') {
        console.log('SIMULAÇÃO DE ENVIO DE WHATSAPP:', { 
          para: numeroFormatado,
          mensagem,
          timestamp: new Date().toISOString()
        });
        
        // Create communication record
        const comunicacao: Comunicacao = {
          id: Date.now().toString(),
          clienteId: cliente.id,
          dividaId: divida.id,
          tipo: 'cobranca',
          mensagem,
          status: 'enviado',
          dataEnvio: new Date().toISOString(),
          dataCriacao: new Date().toISOString()
        };
        
        // Return success with communication object
        return { 
          success: true,
          comunicacao
        };
      }
      
      // Prepare API request to external WhatsApp API
      // This is a simplified example - actual API calls depend on the provider
      const url = `${API_URL}?phone=${numeroFormatado}&text=${encodeURIComponent(mensagem)}`;
      
      // Make API call to WhatsApp service
      const response = await fetch(url, {
        method: 'POST',
        headers: TOKEN ? {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: numeroFormatado,
          message: mensagem,
          from: PHONE_NUMBER
        })
      });
      
      // Process response
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao enviar mensagem WhatsApp:', errorData);
        return { 
          success: false, 
          error: `Erro na API do WhatsApp: ${errorData.message || response.statusText}`
        };
      }
      
      // Success - create communication record
      const responseData = await response.json();
      const comunicacao: Comunicacao = {
        id: responseData.id || Date.now().toString(),
        clienteId: cliente.id,
        dividaId: divida.id,
        tipo: 'cobranca',
        mensagem,
        status: 'enviado',
        dataEnvio: new Date().toISOString(),
        dataCriacao: new Date().toISOString()
      };
      
      return {
        success: true,
        comunicacao
      };
    } catch (error) {
      console.error('Exceção ao enviar mensagem WhatsApp:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem'
      };
    }
  },
  
  /**
   * Build message from template and debt data
   */
  construirMensagemCobranca(
    cliente: Cliente,
    divida: Divida,
    template?: string
  ): string {
    // Calculate debt details
    const mesesAtraso = calcularMesesAtraso(divida.dataVencimento);
    const valorCorrigido = calcularDividaCorrigida(
      divida.valor,
      divida.dataVencimento,
      divida.taxaJuros || 3,
      divida.mesInicioJuros || '2º mês'
    );
    
    // Use default template if none provided
    const templateMensagem = template || 
      "Olá {NOME}, identificamos que sua dívida no valor de {VALOR_ORIGINAL} venceu há {MESES_ATRASO} meses. " +
      "O valor atualizado para pagamento é de {VALOR_CORRIGIDO}. " +
      "Entre em contato conosco para regularizar sua situação.";
    
    // Build message from template and data
    return construirMensagem(
      templateMensagem,
      {
        id: parseInt(cliente.id),
        nome: cliente.nome,
        telefone: cliente.telefone,
        cpf: cliente.cpf,
        data_cadastro: cliente.createdAt
      },
      {
        id: parseInt(divida.id),
        cliente_id: parseInt(cliente.id),
        valor_original: divida.valor,
        data_compra: divida.dataCompra,
        data_vencimento: divida.dataVencimento,
        status_pagamento: divida.status,
        taxa_juros: divida.taxaJuros || 3,
        mes_inicio_juros: 2,
        observacoes: divida.descricao,
        data_criacao: divida.createdAt
      },
      mesesAtraso,
      valorCorrigido
    );
  },
  
  /**
   * Validate if a phone number is in the correct Brazilian format
   */
  validarNumeroTelefone(telefone: string): boolean {
    // Remove all non-digits
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Check if it's a valid Brazilian number (with or without country code)
    // Format: 5511999999999 or 11999999999
    return /^(55)?(\d{10,11})$/.test(numeroLimpo);
  },
  
  /**
   * Format a phone number for WhatsApp API
   */
  formatarNumeroTelefone(telefone: string): string {
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Add country code if missing
    if (numeroLimpo.length === 10 || numeroLimpo.length === 11) {
      return `55${numeroLimpo}`;
    }
    
    return numeroLimpo;
  }
};
