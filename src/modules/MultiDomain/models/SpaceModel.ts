// https://mongoosejs.com/docs/schematypes.html#
import { Schema, model, models } from 'mongoose';

const pallete = new Schema({
  primary: {
    type: String,
  },
  'primary-focus': {
    type: String,
  },
  'primary-content': {
    type: String,
  },
  'base-100': {
    type: String,
  },
  'base-200': {
    type: String,
  },
  'base-300': {
    type: String,
  },
  'base-content': {
    type: String,
  },
  info: {
    type: String,
  },
  'info-content': {
    type: String,
  },
  success: {
    type: String,
  },
  'success-content': {
    type: String,
  },
  warning: {
    type: String,
  },
  'warning-content': {
    type: String,
  },
  error: {
    type: String,
  },
  'error-content': {
    type: String,
  },
});

const space = new Schema({
  name: {
    type: String,
  },
  subdomain: {
    type: String,
  },
  customDomain: {
    type: String,
  },
  logo: {
    type: String,
  },
  cover: {
    type: String,
  },
  pallete,
  presentation: {
    type: String,
  },
  owners: {
    type: Array,
  },
  status: {
    type: String,
    default: 'pending',
  },
});

export const SpaceModel = models.SpaceModel || model('SpaceModel', space);
