import { model, models, Schema } from 'mongoose';

const worker = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'validated'],
    default: 'pending',
  },
  talentLayerId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    sparse: true,
  },
  picture: {
    type: String,
  },
  about: {
    type: String,
  },
  skills: {
    type: [String],
  },
});

export const Worker = models.Worker || model('Worker', worker);
