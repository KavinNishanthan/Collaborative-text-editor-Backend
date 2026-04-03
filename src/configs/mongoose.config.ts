//Importing Mongoose
import mongoose from 'mongoose';


const connect = async () => {
  try {
    mongoose.set('strictQuery', false);
    const res = await mongoose.connect(process.env.MONGOURI || '');
    console.log('Mongodb connected');
    return res;
  } catch (err) {
    console.log('Mongodb Error:', err);
  }
};

export default connect;
