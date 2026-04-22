"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  fromYear?: number;
  toYear?: number;
}

const MONTHS_PT = [
  "Janeiro","Fevereiro","Março","Abril",
  "Maio","Junho","Julho","Agosto",
  "Setembro","Outubro","Novembro","Dezembro",
];

type NavProps = {
  onPreviousClick: () => void;
  onNextClick: () => void;
  previousMonth?: Date;
  nextMonth?: Date;
};

function CalendarNav({ onPreviousClick, onNextClick, previousMonth, nextMonth }: NavProps) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={onPreviousClick}
        disabled={!previousMonth}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150",
          "text-[#8888aa] hover:text-[#f0f0f8] hover:bg-white/10",
          "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8888aa]",
          "border border-transparent hover:border-white/10"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNextClick}
        disabled={!nextMonth}
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150",
          "text-[#8888aa] hover:text-[#f0f0f8] hover:bg-white/10",
          "disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8888aa]",
          "border border-transparent hover:border-white/10"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Selecione sua data de nascimento",
  className,
  fromYear = 1920,
  toYear = new Date().getFullYear() - 13,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Mês exibido no calendário
  const [month, setMonth] = React.useState<Date>(value ?? new Date(2000, 0));

  // Sincroniza quando o valor externo muda
  React.useEffect(() => {
    if (value) setMonth(value);
  }, [value]);

  const years = React.useMemo(
    () => Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i),
    [fromYear, toYear]
  );

  // Prev/next calculados a partir do mês atual
  const prevMonth = month.getMonth() === 0 && month.getFullYear() === fromYear
    ? undefined
    : new Date(month.getFullYear(), month.getMonth() - 1, 1);

  const nextMonth = month.getMonth() === 11 && month.getFullYear() === toYear
    ? undefined
    : new Date(month.getFullYear(), month.getMonth() + 1, 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-12 rounded-xl justify-start text-left font-normal transition-all duration-200",
            "bg-[#111118] border border-white/10 text-[#f0f0f8]",
            "hover:bg-[#1a1a24] hover:border-blue-500/40 hover:text-[#f0f0f8]",
            "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-blue-500/60",
            open && "border-blue-500/50 bg-[#1a1a24]",
            !value && "text-[#8888aa]",
            className
          )}
        >
          <CalendarIcon className={cn(
            "mr-2.5 h-4 w-4 flex-shrink-0 transition-colors",
            value ? "text-blue-400" : "text-[#8888aa]"
          )} />
          {value
            ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-auto p-0 overflow-hidden",
          "bg-[#0e0e16] border border-white/10 rounded-2xl",
          "shadow-2xl shadow-black/70",
          // Só fade, sem slide — elimina o jump
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "duration-150"
        )}
        align="start"
        side="bottom"
        sideOffset={8}
        avoidCollisions={false}
      >
        {/* Header: selects de mês/ano + navegação — tudo numa linha */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-white/[0.06]">

          {/* Select de mês */}
          <div className="relative flex-1">
            <select
              value={month.getMonth()}
              onChange={(e) =>
                setMonth(new Date(month.getFullYear(), parseInt(e.target.value), 1))
              }
              className={cn(
                "w-full h-8 rounded-lg text-sm pl-3 pr-7 appearance-none cursor-pointer",
                "bg-[#1a1a24] border border-white/10 text-[#f0f0f8]",
                "hover:border-blue-500/40 focus:outline-none focus:border-blue-500/60",
                "transition-colors duration-150"
              )}
            >
              {MONTHS_PT.map((m, i) => (
                <option key={i} value={i} className="bg-[#1a1a24]">{m}</option>
              ))}
            </select>
            {/* Chevron decorativo */}
            <ChevronLeft className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8888aa] rotate-[-90deg] pointer-events-none" />
          </div>

          {/* Select de ano */}
          <div className="relative w-[80px]">
            <select
              value={month.getFullYear()}
              onChange={(e) =>
                setMonth(new Date(parseInt(e.target.value), month.getMonth(), 1))
              }
              className={cn(
                "w-full h-8 rounded-lg text-sm pl-3 pr-7 appearance-none cursor-pointer",
                "bg-[#1a1a24] border border-white/10 text-[#f0f0f8]",
                "hover:border-blue-500/40 focus:outline-none focus:border-blue-500/60",
                "transition-colors duration-150"
              )}
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#1a1a24]">{y}</option>
              ))}
            </select>
            <ChevronLeft className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#8888aa] rotate-[-90deg] pointer-events-none" />
          </div>

          {/* Setas prev/next */}
          <CalendarNav
            onPreviousClick={() => prevMonth && setMonth(prevMonth)}
            onNextClick={() => nextMonth && setMonth(nextMonth)}
            previousMonth={prevMonth}
            nextMonth={nextMonth}
          />
        </div>

        {/* Grade de dias — */}
        <DayPicker
          mode="single"
          selected={value}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          locale={ptBR}
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
          disabled={(date) =>
            date > new Date() || date < new Date(`${fromYear}-01-01`)
          }
          showOutsideDays={false}
          classNames={{
            months:    "p-3 pt-2",
            month:     "space-y-2",
            
            month_caption: "hidden",
            nav:           "hidden",
           
            weekdays:  "flex mb-1",
            weekday:   "w-9 text-center text-[11px] font-medium text-[#8888aa] py-1",
            weeks:     "space-y-1",
            week:      "flex",
            day:       "relative h-9 w-9 p-0 text-center",
            day_button: cn(
              "h-9 w-9 w-full rounded-lg text-sm font-normal text-[#c8c8e0]",
              "inline-flex items-center justify-center transition-all duration-150",
              "hover:bg-blue-500/15 hover:text-blue-300",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
            ),
            selected: cn(
              "bg-blue-600 text-white rounded-lg font-medium",
              "hover:bg-blue-500 hover:text-white"
            ),
            today:    "ring-1 ring-blue-500/50 text-blue-300 rounded-lg font-medium",
            outside:  "opacity-20 text-[#8888aa]",
            disabled: "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-[#c8c8e0]",
            hidden:   "invisible",
          }}
        />

        {/* Footer — limpar */}
        {value && (
          <div className="px-3 pb-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => { onChange?.(undefined); setOpen(false); }}
              className={cn(
                "w-full text-xs py-1.5 rounded-lg transition-all duration-150",
                "text-[#8888aa] hover:text-red-400 hover:bg-red-500/10"
              )}
            >
              Limpar data
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}