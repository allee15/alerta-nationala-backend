import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AssemblyPoint, AssemblyPointDocument } from './schemas/assembly-point.schema';
import { CreateAssemblyPointDto } from './dto/create-assembly-point.dto';
import { UpdateAssemblyPointDto } from './dto/update-assembly-point.dto';

function toResponse(point: AssemblyPointDocument) {
  return {
    id: point._id.toString(),
    name: point.name,
    address: point.address,
    lat: point.lat,
    lng: point.lng,
    zone: point.zone,
    capacity: point.capacity ?? null,
    isActive: point.isActive,
  };
}

@Injectable()
export class AssemblyPointsService {
  constructor(
    @InjectModel(AssemblyPoint.name)
    private readonly assemblyPointModel: Model<AssemblyPointDocument>,
  ) {}

  async create(dto: CreateAssemblyPointDto) {
    const point = await this.assemblyPointModel.create({
      name: dto.name,
      address: dto.address,
      lat: dto.lat,
      lng: dto.lng,
      zone: dto.zone,
      capacity: dto.capacity ?? null,
      isActive: true,
    });
    return toResponse(point);
  }

  async findAll() {
    const points = await this.assemblyPointModel.find().sort({ name: 1 });
    return points.map(toResponse);
  }

  async findActiveForZones(zones: string[]) {
    const points = await this.assemblyPointModel
      .find({ zone: { $in: zones }, isActive: true })
      .sort({ name: 1 });
    return points.map(toResponse);
  }

  async update(id: string, dto: UpdateAssemblyPointDto) {
    const point = await this.assemblyPointModel.findByIdAndUpdate(id, dto, { new: true });
    if (!point) {
      throw new NotFoundException('Punctul de adunare nu a fost gasit.');
    }
    return toResponse(point);
  }

  async setActive(id: string, isActive: boolean) {
    const point = await this.assemblyPointModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!point) {
      throw new NotFoundException('Punctul de adunare nu a fost gasit.');
    }
    return toResponse(point);
  }
}