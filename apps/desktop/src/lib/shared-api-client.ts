import { apiClient } from "./api-client";
import type { ApiClient } from "@ordo-todo/auth-provider";
import type {
  UserResponse,
  LoginDto,
  RegisterDto,
  AuthResponse,
} from "@ordo-todo/api-client";

export const sharedApiClient: ApiClient = {
  login: (data: LoginDto): Promise<AuthResponse> => apiClient.login(data),
  register: (data: RegisterDto): Promise<AuthResponse> =>
    apiClient.register(data),
  logout: (): Promise<void> => apiClient.logout(),
  getCurrentUser: (): Promise<UserResponse> => apiClient.getCurrentUser(),
};
