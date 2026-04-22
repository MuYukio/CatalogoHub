'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { authService, ApiError } from '@/services/auth.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Lock, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ProfileSettingsModal() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<'profile' | 'password' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    allowAdultContent: user?.allowAdultContent || false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    if (isOpen && user) {
      setProfileForm({
        name: user.name,
        age: user.age,
        allowAdultContent: user.allowAdultContent,
      });
    }
  }, [isOpen, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('profile');
    try {
      const updated = await authService.updateProfile(profileForm);
      if (user) {
        setUser({
          ...user,
          name: updated.name ?? user.name,
          age: updated.age ?? user.age,
          allowAdultContent: updated.allowAdultContent ?? user.allowAdultContent,
        });
      }
      showToast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas.' });
      setIsOpen(false);
    } catch (err) {
      const error = err as ApiError;
      const message = error.response?.data?.message || 'Não foi possível atualizar.';
      showToast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showToast({ title: 'Erro', description: 'As novas senhas não coincidem.', variant: 'destructive' });
      return;
    }
    setLoading('password');
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });
      showToast({ title: 'Senha alterada', description: 'Sua senha foi atualizada com sucesso.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setIsOpen(false);
    } catch (err) {
      const error = err as ApiError;
      const message = error.response?.data?.message || 'Senha atual incorreta.';
      showToast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== 'EXCLUIR') return;
    setLoading('delete');
    try {
      await authService.deleteAccount();
      logout();
      router.push('/');
      showToast({ title: 'Conta excluída', description: 'Sentiremos sua falta. :(' });
    } catch (err) {
      const error = err as ApiError;
      const message = error.response?.data?.message || 'Não foi possível excluir.';
      showToast({ title: 'Erro', description: message, variant: 'destructive' });
    } finally {
      setLoading(null);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9 ch-btn-outline">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-0">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Configurações da conta</DialogTitle>
          <DialogDescription>
            Altere seus dados pessoais, senha ou exclua sua conta permanentemente.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="h-4 w-4" /> Senha
            </TabsTrigger>
            <TabsTrigger value="delete" className="gap-2 text-red-500">
              <Trash2 className="h-4 w-4" /> Excluir
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  min={13}
                  max={120}
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="adult"
                  checked={profileForm.allowAdultContent}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, allowAdultContent: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="adult" className="text-sm font-normal">
                  Permitir conteúdo adulto (18+)
                </Label>
              </div>
              <Button type="submit" disabled={loading === 'profile'} className="w-full">
                {loading === 'profile' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Salvar alterações
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" disabled={loading === 'password'} className="w-full">
                {loading === 'password' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Alterar senha
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="delete">
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Ação irreversível</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  Esta ação excluirá permanentemente sua conta e todos os seus favoritos. Você não
                  poderá recuperar seus dados.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmDelete">
                  Digite <span className="font-mono font-bold">EXCLUIR</span> para confirmar
                </Label>
                <Input
                  id="confirmDelete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="EXCLUIR"
                />
              </div>
              <Button
                variant="destructive"
                disabled={confirmDelete !== 'EXCLUIR' || loading === 'delete'}
                onClick={handleDeleteAccount}
                className="w-full"
              >
                {loading === 'delete' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Excluir minha conta permanentemente
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}