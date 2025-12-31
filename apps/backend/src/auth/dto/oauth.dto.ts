export class OAuthDto {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}
