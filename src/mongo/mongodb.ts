import mongoose from 'mongoose';
import mongoose from 'mongoose';

const { NEXT_MONGO_URI } = process.env;
const { NEXT_MONGO_URI } = process.env;

export const connection = async () => {
  const conn = await mongoose.connect(NEXT_MONGO_URI as string).catch(err => console.log(err));
  return { conn };
};
