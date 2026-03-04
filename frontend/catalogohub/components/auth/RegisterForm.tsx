"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  User,
  Calendar,
  Gamepad2,
  Tv,
  Star,
  Heart,
} from "lucide-react";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { useRegister } from "@/hooks/shared/useAuth";
import { useToast } from "@/hooks/use-toast";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { BackHomeButton } from "../ui/back-home-button";
import { DatePicker } from "../ui/date-picker";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>();

  const router = useRouter();
  const { showToast } = useToast();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 18,
      allowAdultContent: false,
      acceptTerms: false,
    },
  });

  const password = watch("password");
  const allowAdultContent = watch("allowAdultContent");
  const acceptTerms = watch("acceptTerms");

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        age: data.age,
        allowAdultContent: data.allowAdultContent,
      },
      {
        onSuccess: () => {
          setFormData(data);
          setIsRegistered(true);
          showToast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao CatalogoHub! Redirecionando...",
          });
          setTimeout(() => router.push("/profile"), 2000);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            "Erro ao criar conta. Tente novamente.";
          showToast({
            title: "Erro no registro",
            description: errorMessage,
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isRegistered && formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-2">Tudo certo! 🎉</h3>
            <p className="text-muted-foreground text-lg">
              Bem-vindo(a),{" "}
              <span className="font-semibold text-foreground">
                {formData.name}
              </span>
              !
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
            <h4 className="font-semibold mb-4 text-left">Sua conta:</h4>
            <div className="space-y-3 text-left">
              {[
                { label: "Nome", value: formData.name },
                { label: "Email", value: formData.email },
                { label: "Idade", value: `${formData.age} anos` },
                {
                  label: "Conteúdo adulto",
                  value: formData.allowAdultContent ? "Permitido" : "Bloqueado",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-muted-foreground text-sm">
                    {item.label}
                  </span>
                  <span className="font-medium text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Redirecionando para seu perfil...</p>
          </div>
          <Button
            onClick={() => router.push("/profile")}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Ir para o Perfil agora
          </Button>
        </div>
      </div>
    );
  }

  function calcularIdade(dataNascimento: Date): number {
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
    const mes = hoje.getMonth() - dataNascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              Catalogo
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-black">
                Hub
              </span>
            </span>
          </div>

          <div className="mb-8">
            <BackHomeButton />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Criar conta gratuita
            </h1>
            <p className="text-muted-foreground">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>

          {/* Erro global */}
          {registerMutation.isError && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                {(registerMutation.error as any)?.response?.data?.message ||
                  "Erro ao criar conta."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" /> Nome
                completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                disabled={registerMutation.isPending}
                className={`h-12 rounded-xl border-2 transition-colors focus:border-blue-500 ${errors.name ? "border-red-400" : "border-border"}`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Mail className="h-3.5 w-3.5 text-muted-foreground" /> E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                disabled={registerMutation.isPending}
                className={`h-12 rounded-xl border-2 transition-colors focus:border-blue-500 ${errors.email ? "border-red-400" : "border-border"}`}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Idade */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Data de nascimento
              </Label>
              <DatePicker
                value={birthDate}
                onChange={(date) => {
                  setBirthDate(date);
                  if (date) {
                    setValue("age", calcularIdade(date));
                  }
                }}
                disabled={registerMutation.isPending}
                className={errors.age ? "border-red-400" : "border-border"}
              />
              
              {errors.age && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold flex items-center gap-2"
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  disabled={registerMutation.isPending}
                  className={`h-12 rounded-xl border-2 pr-12 transition-colors focus:border-blue-500 ${errors.password ? "border-red-400" : "border-border"}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && <PasswordStrengthMeter password={password} />}
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold"
              >
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita sua senha"
                  disabled={registerMutation.isPending}
                  className={`h-12 rounded-xl border-2 pr-12 transition-colors focus:border-blue-500 ${errors.confirmPassword ? "border-red-400" : "border-border"}`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="allowAdultContent"
                  checked={allowAdultContent}
                  onChange={(e) =>
                    setValue("allowAdultContent", e.target.checked)
                  }
                  disabled={registerMutation.isPending}
                  className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium leading-none group-hover:text-foreground transition-colors">
                    Permitir conteúdo adulto (18+)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exibe jogos e animes com classificação adulta
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setValue("acceptTerms", e.target.checked)}
                  disabled={registerMutation.isPending}
                  className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium leading-none">
                    Aceito os{" "}
                    <Link
                      href="/terms"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      Termos de Serviço
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                  </p>
                </div>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 mt-2"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                </span>
              ) : (
                "Criar conta gratuita"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* visual  */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex-col items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Ícones flutuantes */}
        <div
          className="absolute top-20 right-16 opacity-20 animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        >
          <Tv size={48} className="text-white" />
        </div>
        <div
          className="absolute bottom-24 left-20 opacity-20 animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "3s" }}
        >
          <Gamepad2 size={40} className="text-white" />
        </div>
        <div
          className="absolute top-1/3 left-12 opacity-15 animate-bounce"
          style={{ animationDelay: "0.8s", animationDuration: "4s" }}
        >
          <Star size={32} className="text-white" />
        </div>
        <div
          className="absolute bottom-1/3 right-10 opacity-15 animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        >
          <Heart size={28} className="text-white" />
        </div>

        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <span className="text-3xl font-bold text-white">Catalogo</span>
              <span className="text-3xl font-black text-white/80">Hub</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Comece sua
            <br />
            jornada hoje!
          </h2>

          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Crie sua conta gratuita e organize sua coleção de jogos e animes
            favoritos em um só lugar.
          </p>

          <div className="space-y-3 text-left">
            {[
              {
                icon: <Gamepad2 size={18} />,
                text: "Acesso a mais de 500 mil jogos",
              },
              {
                icon: <Tv size={18} />,
                text: "Mais de 20 mil animes catalogados",
              },
              {
                icon: <Heart size={18} />,
                text: "Listas de favoritos personalizadas",
              },
              {
                icon: <Star size={18} />,
                text: "Exportação em PDF da sua coleção",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"
              >
                <div className="text-white/80 flex-shrink-0">{item.icon}</div>
                <span className="text-white/90 text-sm font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
