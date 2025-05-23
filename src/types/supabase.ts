
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
          cpf: string
          telefone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id: string
          nome: string
          cpf: string
          telefone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          nome?: string
          cpf?: string
          telefone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dividas: {
        Row: {
          id: string
          organizacao_id: string
          cliente_id: string
          valor: number
          data_compra: string
          data_vencimento: string
          status: string
          taxa_juros: number
          mes_inicio_juros: string
          descricao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organizacao_id?: string
          cliente_id: string
          valor: number
          data_compra: string
          data_vencimento: string
          status: string
          taxa_juros?: number
          mes_inicio_juros?: string
          descricao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizacao_id?: string
          cliente_id?: string
          valor?: number
          data_compra?: string
          data_vencimento?: string
          status?: string
          taxa_juros?: number
          mes_inicio_juros?: string
          descricao?: string | null
          created_at?: string
          updated_at?: string
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
