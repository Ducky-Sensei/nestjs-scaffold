import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { OrganizationService } from '../organization/organization.service';
import { CustomerThemeResponseDto } from './dto/customer-theme-response.dto';

@Injectable()
export class ThemeService {
    constructor(
        private readonly organizationService: OrganizationService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async getCustomerTheme(customerId: string): Promise<CustomerThemeResponseDto> {
        const cacheKey = `theme:customer:${customerId}`;

        const cached = await this.cacheManager.get<CustomerThemeResponseDto>(cacheKey);
        if (cached) {
            return cached;
        }

        const organization = await this.organizationService.findByCustomerId(customerId);

        if (!organization) {
            throw new NotFoundException(`No organization found with customerId '${customerId}'`);
        }

        if (!organization.theme) {
            throw new NotFoundException(
                `Organization '${customerId}' does not have a custom theme configured`,
            );
        }

        const response: CustomerThemeResponseDto = {
            customerId: organization.customerId,
            customerName: organization.name,
            theme: organization.theme,
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
        };

        await this.cacheManager.set(cacheKey, response, 1800000);

        return response;
    }

    async invalidateCustomerThemeCache(customerId: string): Promise<void> {
        const cacheKey = `theme:customer:${customerId}`;
        await this.cacheManager.del(cacheKey);
    }
}
