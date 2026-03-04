"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, disabled, placeholder = "Selecione sua data de nascimento", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>  
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-12 rounded-xl border-2 justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {value ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          locale={ptBR}
          captionLayout="dropdown"
          fromYear={1920}
          toYear={new Date().getFullYear() - 13}
          defaultMonth={value ?? new Date(2000, 0)}
          disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}