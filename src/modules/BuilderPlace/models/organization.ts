import { Schema, model, models } from 'mongoose';
import { JobType } from '../../../types';

const organizationSchema = new Schema({
  name: {
    type: String,
    maxlength: 10,
    required: true,
    unique: true,
  },
  about: {
    type: String,
    maxlength: 255,
    required: true,
    unique: false,
  },
  jobType: {
    type: String,
    enum: JobType,
    required: true,
    unique: false,
  },
  imageUrl: {
    type: String,
    required: true,
    unique: false,
  },
});

export const Organization = models.Organization || model('Organization', organizationSchema);
