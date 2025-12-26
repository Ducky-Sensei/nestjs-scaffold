import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CustomerThemeResponseDto } from './dto/customer-theme-response.dto';
import { ThemeService } from './theme.service';

@Controller('v1/themes')
export class ThemeController {
    constructor(private readonly themeService: ThemeService) {}

    @Public()
    @Get('customer/:customerId')
    async getCustomerTheme(
        @Param('customerId') customerId: string,
    ): Promise<CustomerThemeResponseDto> {
        return this.themeService.getCustomerTheme(customerId);
    }
}
