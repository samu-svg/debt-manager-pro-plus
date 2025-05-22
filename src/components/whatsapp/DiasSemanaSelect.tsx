
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

// Dias da semana disponíveis para seleção
export const diasSemanaOpcoes = [
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

interface DiasSemanaSelectProps {
  form: UseFormReturn<any>;
}

/**
 * Componente para selecionar dias da semana
 */
const DiasSemanaSelect = ({ form }: DiasSemanaSelectProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {diasSemanaOpcoes.map((dia) => (
        <FormField
          key={dia.id}
          control={form.control}
          name="diasSemana"
          render={({ field }) => {
            return (
              <FormItem key={dia.id} className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(dia.id)}
                    onCheckedChange={(checked) => {
                      const currentValues = [...field.value];
                      if (checked) {
                        field.onChange([...currentValues, dia.id]);
                      } else {
                        field.onChange(currentValues.filter((value) => value !== dia.id));
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {dia.label}
                </FormLabel>
              </FormItem>
            );
          }}
        />
      ))}
    </div>
  );
};

export default DiasSemanaSelect;
