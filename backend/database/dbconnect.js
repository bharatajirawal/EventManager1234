import mongoose from "mongoose";
export const dbconnect=()=>{
    mongoose
    .connect(process.env.MONGO_URI,
    {dbName:"MERN_STACK_NAME"})
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err)=>{
        console.log(err);
    });
    };