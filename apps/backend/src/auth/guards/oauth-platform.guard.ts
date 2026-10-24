import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Base para los guards de OAuth que propagan la plataforma destino en el
 * parámetro `state` del authorize request. passport-oauth2 envía ese `state`
 * al proveedor y el proveedor lo devuelve en el callback, donde el controller
 * decide el redirect (`ordo://auth/callback` para desktop/mobile, dashboard
 * web para web). Sin esto, `?platform=desktop` se pierde en el round-trip y
 * el redirect deep link es inalcanzable.
 *
 * Nota: el state no se verifica contra un store (passport-oauth2 usa
 * NullStore cuando no hay sesión), igual que el flujo aceptado de desktop.
 * PKCE (PkceService) es la mejora pendiente para atar tokens al flujo.
 */
function platformAuthenticateOptions(context: ExecutionContext) {
  const request = context.switchToHttp().getRequest();
  const platform = request?.query?.platform;
  return platform ? { state: String(platform) } : undefined;
}

@Injectable()
export class GoogleOAuthPlatformGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    return platformAuthenticateOptions(context);
  }
}

@Injectable()
export class GitHubOAuthPlatformGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext) {
    return platformAuthenticateOptions(context);
  }
}
