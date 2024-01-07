import { model, models, Schema } from 'mongoose';
import { IHirerProfile } from '../types';

const hirer = new Schema<IHirerProfile>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
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
  weeklyTransactionCounter: {
    type: Number,
  },
  counterStartDate: {
    type: Number,
  },
});

export const Worker = models.Hirer || model('Hirer', hirer);
