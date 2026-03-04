
"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertTriangle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };

    setChecks(newChecks);
    const score = Object.values(newChecks).filter(Boolean).length;
    setStrength(score);
  }, [password]);

  const getStrengthLabel = () => {
    switch (strength) {
      case 0:
      case 1:
        return { label: "Muito fraca", color: "text-red-500", bg: "bg-red-500" };
      case 2:
        return { label: "Fraca", color: "text-orange-500", bg: "bg-orange-500" };
      case 3:
        return { label: "Média", color: "text-yellow-500", bg: "bg-yellow-500" };
      case 4:
        return { label: "Forte", color: "text-lime-500", bg: "bg-lime-500" };
      case 5:
        return { label: "Muito forte", color: "text-green-500", bg: "bg-green-500" };
      default:
        return { label: "Muito fraca", color: "text-red-500", bg: "bg-red-500" };
    }
  };

  const strengthInfo = getStrengthLabel();

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Força da senha:</span>
          <span className={`text-sm font-semibold ${strengthInfo.color}`}>
            {strengthInfo.label}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthInfo.bg} transition-all duration-300`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {checks.length ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={checks.length ? "text-green-600" : "text-gray-500"}>
            Pelo menos 8 caracteres
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {checks.uppercase ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={checks.uppercase ? "text-green-600" : "text-gray-500"}>
            Pelo menos uma letra maiúscula
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {checks.lowercase ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={checks.lowercase ? "text-green-600" : "text-gray-500"}>
            Pelo menos uma letra minúscula
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {checks.number ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={checks.number ? "text-green-600" : "text-gray-500"}>
            Pelo menos um número
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {checks.special ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
          <span className={checks.special ? "text-green-600" : "text-gray-500"}>
            Pelo menos um caractere especial (@$!%*?&)
          </span>
        </div>
      </div>
      {strength < 3 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Dica de segurança:</strong> Use uma senha única que você não
            usa em outros sites. Considere usar um gerenciador de senhas.
          </p>
        </div>
      )}
    </div>
  );
}