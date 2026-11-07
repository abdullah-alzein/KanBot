import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '../types/api'
import { request } from './client'

export const register = (body: RegisterRequest) => request<AuthResponse>('POST', '/auth/register', body)
export const login = (body: LoginRequest) => request<AuthResponse>('POST', '/auth/login', body)
export const me = () => request<MeResponse>('GET', '/auth/me')
