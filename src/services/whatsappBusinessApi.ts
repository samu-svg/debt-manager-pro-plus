
// WhatsApp Business API service
import { supabase } from '@/lib/supabase';

// WhatsApp Business API configuration
const API_URL = import.meta.env.VITE_WHATSAPP_BUSINESS_API_URL;
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

interface SendTextMessageParams {
  destinationPhone: string;
  message: string;
  organizationId: string;
  clienteId: string;
  dividaId?: string | null;
}

interface SendTemplateMessageParams {
  destinationPhone: string;
  templateName: string;
  languageCode: string;
  components: any[];
  organizationId: string;
  clienteId: string;
  dividaId?: string | null;
}

export const whatsappBusinessApi = {
  /**
   * Send a text message via WhatsApp Business API
   */
  async sendTextMessage({
    destinationPhone,
    message,
    organizationId,
    clienteId,
    dividaId = null
  }: SendTextMessageParams) {
    try {
      // Format the phone number
      const formattedPhone = this.formatPhoneNumber(destinationPhone);
      
      // Check if we have valid API configuration
      if (!API_URL || !ACCESS_TOKEN || !PHONE_NUMBER_ID) {
        console.error('Missing WhatsApp Business API configuration');
        return { success: false, error: 'Missing API configuration' };
      }
      
      // Send the message to WhatsApp Business API
      const response = await fetch(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        return { success: false, error: errorData.error?.message || 'Failed to send message' };
      }
      
      const data = await response.json();
      
      // Store the message in the database
      const { error: dbError } = await supabase
        .from('comunicacoes_whatsapp')
        .insert({
          organizacao_id: organizationId,
          cliente_id: clienteId,
          divida_id: dividaId,
          tipo: 'cobranca',
          conteudo: message,
          numero_destino: formattedPhone,
          message_id: data.messages?.[0]?.id,
          status_envio: 'enviado'
        });
      
      if (dbError) {
        console.error('Error saving message to database:', dbError);
      }
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        whatsappData: data
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Send a template message via WhatsApp Business API
   */
  async sendTemplateMessage({
    destinationPhone,
    templateName,
    languageCode = 'pt_BR',
    components,
    organizationId,
    clienteId,
    dividaId = null
  }: SendTemplateMessageParams) {
    try {
      // Format the phone number
      const formattedPhone = this.formatPhoneNumber(destinationPhone);
      
      // Check if we have valid API configuration
      if (!API_URL || !ACCESS_TOKEN || !PHONE_NUMBER_ID) {
        console.error('Missing WhatsApp Business API configuration');
        return { success: false, error: 'Missing API configuration' };
      }
      
      // Send the template message to WhatsApp Business API
      const response = await fetch(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API error:', errorData);
        return { success: false, error: errorData.error?.message || 'Failed to send message' };
      }
      
      const data = await response.json();
      
      // Generate content summary for database
      const contentSummary = `Template: ${templateName}`;
      
      // Store the message in the database
      const { error: dbError } = await supabase
        .from('comunicacoes_whatsapp')
        .insert({
          organizacao_id: organizationId,
          cliente_id: clienteId,
          divida_id: dividaId,
          tipo: 'template',
          conteudo: contentSummary,
          numero_destino: formattedPhone,
          message_id: data.messages?.[0]?.id,
          status_envio: 'enviado'
        });
      
      if (dbError) {
        console.error('Error saving message to database:', dbError);
      }
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id,
        whatsappData: data
      };
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Process webhook events from WhatsApp Business API
   */
  async processWebhook(payload: any) {
    try {
      if (!payload.entry || !payload.entry[0].changes) {
        return { success: false, error: 'Invalid webhook payload' };
      }
      
      const changes = payload.entry[0].changes;
      
      for (const change of changes) {
        const value = change.value;
        
        if (!value.messages) continue;
        
        for (const message of value.messages) {
          // Process each message
          console.log('Received message:', message);
          
          // You can implement your message handling logic here
          // For example, store incoming messages in the database
        }
        
        // Process delivery status updates
        if (value.statuses) {
          for (const status of value.statuses) {
            const messageId = status.id;
            
            // Update message status in the database
            if (status.status === 'delivered') {
              await supabase
                .from('comunicacoes_whatsapp')
                .update({ 
                  status_envio: 'entregue',
                  data_entrega: new Date().toISOString()
                })
                .eq('message_id', messageId);
            } else if (status.status === 'read') {
              await supabase
                .from('comunicacoes_whatsapp')
                .update({ 
                  status_envio: 'lido',
                  data_leitura: new Date().toISOString()
                })
                .eq('message_id', messageId);
            }
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error processing webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  /**
   * Format phone number to WhatsApp API format
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Ensure there's a country code (default to Brazil)
    if (cleaned.length === 11 || cleaned.length === 10) {
      cleaned = `55${cleaned}`;
    } else if (!cleaned.startsWith('55') && cleaned.length >= 12) {
      // If it's an international number without the country code
      cleaned = `55${cleaned}`;
    }
    
    return cleaned;
  },
  
  /**
   * Check if the WhatsApp Business API is properly configured
   */
  isConfigured(): boolean {
    return !!(API_URL && ACCESS_TOKEN && PHONE_NUMBER_ID);
  }
};

export default whatsappBusinessApi;
