
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizacoes: {
        Row: {
          id: string
          nome: string
          slug: string
          plano: string
          limite_devedores: number
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          plano?: string
          limite_devedores?: number
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          plano?: string
          limite_devedores?: number
          created_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          organizacao_id: string | null
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          organizacao_id?: string | null
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string | null
          email?: string
          role?: string
          created_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          organizacao_id: string
          nome: string
          email: string | null
          telefone: string | null
          whatsapp: string | null
          documento: string | null
          endereco: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organizacao_id: string
          nome: string
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          documento?: string | null
          endereco?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          nome?: string
          email?: string | null
          telefone?: string | null
          whatsapp?: string | null
          documento?: string | null
          endereco?: string | null
          created_at?: string
        }
      }
      dividas: {
        Row: {
          id: string
          organizacao_id: string
          cliente_id: string
          valor_original: number
          valor_atual: number
          data_vencimento: string
          status: string
          taxa_juros: number
          tipo_juros: string
          descricao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organizacao_id: string
          cliente_id: string
          valor_original: number
          valor_atual: number
          data_vencimento: string
          status?: string
          taxa_juros?: number
          tipo_juros?: string
          descricao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          cliente_id?: string
          valor_original?: number
          valor_atual?: number
          data_vencimento?: string
          status?: string
          taxa_juros?: number
          tipo_juros?: string
          descricao?: string | null
          created_at?: string
        }
      }
      comunicacoes_whatsapp: {
        Row: {
          id: string
          organizacao_id: string
          cliente_id: string
          divida_id: string | null
          tipo: string
          conteudo: string
          numero_destino: string
          message_id: string | null
          status_envio: string
          data_envio: string
          data_entrega: string | null
          data_leitura: string | null
        }
        Insert: {
          id?: string
          organizacao_id: string
          cliente_id: string
          divida_id?: string | null
          tipo: string
          conteudo: string
          numero_destino: string
          message_id?: string | null
          status_envio?: string
          data_envio?: string
          data_entrega?: string | null
          data_leitura?: string | null
        }
        Update: {
          id?: string
          organizacao_id?: string
          cliente_id?: string
          divida_id?: string | null
          tipo?: string
          conteudo?: string
          numero_destino?: string
          message_id?: string | null
          status_envio?: string
          data_envio?: string
          data_entrega?: string | null
          data_leitura?: string | null
        }
      }
    }
  }
}
