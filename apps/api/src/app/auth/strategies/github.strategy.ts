import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import type { Configuration } from '../../../config/configuration';
import { AuthService } from '../auth.service';
import type { OAuthProfileDto } from '../dto/oauth-profile.dto';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private readonly authService: AuthService,
        readonly configService: ConfigService<Configuration, true>,
    ) {
        const authConfig = configService.get('auth', { infer: true });

        super({
            clientID: authConfig.github.clientId,
            clientSecret: authConfig.github.clientSecret,
            callbackURL: authConfig.github.callbackUrl,
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function,
    ): Promise<any> {
        const { id, emails, displayName, username, photos } = profile;

        // GitHub might not return email if user has no public email
        const email = emails?.[0]?.value || `${username}@github.local`;

        const oauthProfile: OAuthProfileDto = {
            provider: 'github',
            providerId: id,
            email: email,
            name: displayName || username,
            profileData: {
                accessToken,
                username,
                photos: photos?.map((p: any) => p.value),
                rawProfile: profile._json,
            },
        };

        const user = await this.authService.findOrCreateOAuthUser(oauthProfile);

        done(null, user);
    }
}
