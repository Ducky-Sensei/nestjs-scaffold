import { Module } from '@nestjs/common';
import { OrganizationModule } from '../organization/organization.module';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
    imports: [OrganizationModule],
    controllers: [ThemeController],
    providers: [ThemeService],
    exports: [ThemeService],
})
export class ThemeModule {}
