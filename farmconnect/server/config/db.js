import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://vinumallela64_db_user:RJxw7xN2lRremHgq@cluster0.a3bu1i6.mongodb.net/?appName=Cluster0"
    );

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
