import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackingDto } from './tracking.dto';
import { Tracking, TrackingDocument } from './tracking.schema';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Tracking.name)
    private readonly trackingModel: Model<TrackingDocument>,
  ) {}

  async trackLocation(trackingDto: TrackingDto): Promise<Tracking> {
    const { userId, latitude, longitude } = trackingDto;

    // Simpan lokasi ke MongoDB
    const tracking = new this.trackingModel({ userId, latitude, longitude });
    return tracking.save();
  }

  async updateLocation(trackingDto: TrackingDto): Promise<Tracking> {
    const { userId, latitude, longitude } = trackingDto;

    // Update lokasi di MongoDB
    const updatedTracking = await this.trackingModel.findOneAndUpdate(
      { userId },
      { latitude, longitude },
      { new: true, upsert: true },
    );

    if (!updatedTracking) {
      throw new NotFoundException('User not found');
    }

    return updatedTracking;
  }

  async getLocation(userId: number): Promise<Tracking> {
    const tracking = await this.trackingModel.findOne({ userId });
    if (!tracking) {
      throw new NotFoundException('User not found');
    }
    return tracking;
  }
}
