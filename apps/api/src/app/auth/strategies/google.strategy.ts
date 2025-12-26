import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import type { Configuration } from '../../../config/configuration';
import { AuthService } from '../auth.service';
import type { OAuthProfileDto } from '../dto/oauth-profile.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly authService: AuthService,
        readonly configService: ConfigService<Configuration, true>,
    ) {
        const authConfig = configService.get('auth', { infer: true });

        super({
            clientID: authConfig.google.clientId,
            clientSecret: authConfig.google.clientSecret,
            callbackURL: authConfig.google.callbackUrl,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, emails, displayName, photos } = profile;

        const oauthProfile: OAuthProfileDto = {
            provider: 'google',
            providerId: id,
            email: emails[0].value,
            name: displayName,
            profileData: {
                accessToken,
                photos: photos?.map((p: any) => p.value),
                rawProfile: profile._json,
            },
        };

        const user = await this.authService.findOrCreateOAuthUser(oauthProfile);

        done(null, user);
    }
}
