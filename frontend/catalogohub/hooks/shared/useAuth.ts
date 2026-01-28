import { useMutation, useQuery } from "@tanstack/react-query";
import { authService} from "@/services";
import { useAuthStore } from "@/stores/auth.store";
import { LoginData, RegisterData } from "@/types";

export function useLogin(){
    return useMutation({
        mutationFn: (data: LoginData) => authService.login(data),
        onSuccess: (response) =>{
            useAuthStore.getState().login(response.token, response.user)
        },
    })
}

export function useRegister(){
    return useMutation({
        mutationFn: (data: RegisterData) => authService.register(data),
        onSuccess: (response) =>{
            useAuthStore.getState().login(response.token,response.user)
        },
    })
}

export function useAuth() {
    const { user, isAuthenticated } = useAuthStore()

    return {
        user,
        isAuthenticated,
        isLoading: false,
    }
}