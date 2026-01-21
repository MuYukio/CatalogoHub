import axios from "axios";

const API_BASE_URL = "http://localhost:5414"

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json'
    },
})

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config)=>{
    if(typeof window !== 'undefined'){
        const token = localStorage.getItem('token')

        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido/expirou
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)