export interface OAuthProfileDto {
    provider: 'google' | 'github';
    providerId: string;
    email: string;
    name: string | null;
    profileData: Record<string, any>;
}
