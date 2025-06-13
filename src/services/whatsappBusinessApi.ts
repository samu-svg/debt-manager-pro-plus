
// Remove the supabase import and update the file
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

interface WhatsAppMessage {
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface WhatsAppResponse {
  messages: Array<{
    id: string;
  }>;
}

const sendMessage = async (
  phoneNumberId: string,
  accessToken: string,
  message: WhatsAppMessage
): Promise<WhatsAppResponse | null> => {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Error sending WhatsApp message:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Error details:', errorData);
      return null;
    }

    const data: WhatsAppResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return null;
  }
};

// Check if WhatsApp Business API is configured
const isConfigured = (): boolean => {
  const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  return !!(phoneNumberId && accessToken);
};

// Export the API object that StatusConexao expects
export const whatsappBusinessApi = {
  isConfigured,
  sendMessage
};

// Also export individual functions for flexibility
export { sendMessage };
