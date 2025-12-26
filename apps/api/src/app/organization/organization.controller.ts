import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Post()
    async create(
        @Body() createOrganizationDto: CreateOrganizationDto,
    ): Promise<OrganizationResponseDto> {
        const organization = await this.organizationService.create(createOrganizationDto);
        return plainToInstance(OrganizationResponseDto, organization);
    }

    @Get()
    async findAll(): Promise<OrganizationResponseDto[]> {
        const organizations = await this.organizationService.findAll();
        return plainToInstance(OrganizationResponseDto, organizations);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<OrganizationResponseDto> {
        const organization = await this.organizationService.findOne(id);
        return plainToInstance(OrganizationResponseDto, organization);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateOrganizationDto: UpdateOrganizationDto,
    ): Promise<OrganizationResponseDto> {
        const organization = await this.organizationService.update(id, updateOrganizationDto);
        return plainToInstance(OrganizationResponseDto, organization);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        return this.organizationService.remove(id);
    }

    @Post(':id/members/:userId')
    async addMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ): Promise<OrganizationResponseDto> {
        const organization = await this.organizationService.addMember(id, userId);
        return plainToInstance(OrganizationResponseDto, organization);
    }

    @Delete(':id/members/:userId')
    async removeMember(
        @Param('id') id: string,
        @Param('userId') userId: string,
    ): Promise<OrganizationResponseDto> {
        const organization = await this.organizationService.removeMember(id, userId);
        return plainToInstance(OrganizationResponseDto, organization);
    }
}
