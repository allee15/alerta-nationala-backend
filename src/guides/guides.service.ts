import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Guide, GuideDocument } from './schemas/guide.schema';

function toGuideResponse(guide: GuideDocument) {
  return {
    id: guide._id.toString(),
    title: guide.title,
    category: guide.category,
    summary: guide.summary,
    version: guide.version,
    sections: guide.sections,
  };
}

@Injectable()
export class GuidesService {
  constructor(
    @InjectModel(Guide.name) private readonly guideModel: Model<GuideDocument>,
  ) {}

  async findAll() {
    const guides = await this.guideModel.find().sort({ title: 1 });
    return guides.map(toGuideResponse);
  }

  async findVersions() {
    const guides = await this.guideModel.find().select('_id version');
    return guides.map((g) => ({ id: g._id.toString(), version: g.version }));
  }

  async findOne(id: string) {
    const guide = await this.guideModel.findById(id);
    if (!guide) {
      throw new NotFoundException('Ghidul nu a fost gasit.');
    }
    return toGuideResponse(guide);
  }
}