import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
    ) {}

    async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
        const existingOrg = await this.organizationRepository.findOne({
            where: { customerId: createOrganizationDto.customerId },
        });

        if (existingOrg) {
            throw new ConflictException(
                `Organization with customerId '${createOrganizationDto.customerId}' already exists`,
            );
        }

        const organization = this.organizationRepository.create(createOrganizationDto);
        return this.organizationRepository.save(organization);
    }

    async findAll(): Promise<Organization[]> {
        return this.organizationRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { id },
            relations: ['members'],
        });

        if (!organization) {
            throw new NotFoundException(`Organization with id '${id}' not found`);
        }

        return organization;
    }

    async findByCustomerId(customerId: string): Promise<Organization | null> {
        return this.organizationRepository.findOne({
            where: { customerId },
        });
    }

    async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
        const organization = await this.findOne(id);

        if (
            updateOrganizationDto.customerId &&
            updateOrganizationDto.customerId !== organization.customerId
        ) {
            const existingOrg = await this.organizationRepository.findOne({
                where: { customerId: updateOrganizationDto.customerId },
            });

            if (existingOrg) {
                throw new ConflictException(
                    `Organization with customerId '${updateOrganizationDto.customerId}' already exists`,
                );
            }
        }

        Object.assign(organization, updateOrganizationDto);
        return this.organizationRepository.save(organization);
    }

    async remove(id: string): Promise<void> {
        const organization = await this.findOne(id);
        await this.organizationRepository.remove(organization);
    }

    async addMember(organizationId: string, userId: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId },
            relations: ['members'],
        });

        if (!organization) {
            throw new NotFoundException(`Organization with id '${organizationId}' not found`);
        }

        const isMember = organization.members.some((member) => member.id === userId);
        if (isMember) {
            throw new ConflictException('User is already a member of this organization');
        }

        return organization;
    }

    async removeMember(organizationId: string, userId: string): Promise<Organization> {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId },
            relations: ['members'],
        });

        if (!organization) {
            throw new NotFoundException(`Organization with id '${organizationId}' not found`);
        }

        organization.members = organization.members.filter((member) => member.id !== userId);

        return this.organizationRepository.save(organization);
    }
}
