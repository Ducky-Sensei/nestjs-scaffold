import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { RbacService } from './rbac.service';

@Module({
    imports: [TypeOrmModule.forFeature([Role, Permission])],
    providers: [RbacService],
    exports: [RbacService, TypeOrmModule],
})
export class RbacModule {}
