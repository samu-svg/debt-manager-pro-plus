
import { z } from 'zod';

// Template padrão da mensagem
export const TEMPLATE_PADRAO = "Olá {NOME}, sua dívida de R$ {VALOR_ORIGINAL} venceu há {MESES_ATRASO} meses. Valor atualizado: R$ {VALOR_CORRIGIDO}. Entre em contato para quitação.";

// Schema para validação do formulário
export const configuracaoSchema = z.object({
  templateMensagem: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres' }),
  horarioEnvio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido' }),
  limiteDiario: z.number().int().min(1, { message: 'O limite deve ser pelo menos 1' }).max(100, { message: 'O limite não pode exceder 100' }),
  diasSemana: z.array(z.number()).min(1, { message: 'Selecione pelo menos um dia da semana' }),
});

// Tipo derivado do schema
export type ConfiguracaoMensagemValues = z.infer<typeof configuracaoSchema>;
