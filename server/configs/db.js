import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected successfully");
        });

        let mongodbUri=process.env.MONGODB_URI;
        const projectName="resume_builder";

        if(!mongodbUri){
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        if(mongodbUri.endsWith("/")){
            mongodbUri=mongodbUri.slice(0,-1);
        }
        await mongoose.connect(`${mongodbUri}/${projectName}`)
    }
     catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }

}

export default connectDB;