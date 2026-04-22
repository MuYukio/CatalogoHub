import { api } from "@/lib/api";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const payload = { ...data, confirmPassword: data.password };
    const response = await api.post("/api/Auth/register", payload);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/api/Auth/login", data);
    return response.data;
  },

  getSession: async (): Promise<AuthResponse | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const response = await api.get("/api/Auth/me");
      return response.data;
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  },


  updateProfile: async (data: {
    name?: string;
    age?: number;
    allowAdultContent?: boolean;
  }) : Promise<User>  => {
    const response = await api.put("/api/Auth/profile", data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    const response = await api.put("/api/Auth/change-password", data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete("/api/Auth/account");
    return response.data;
  },
};
