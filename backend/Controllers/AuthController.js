const User=require('../Models/user')

const bcrypt=require('bcrypt');
 export const signup=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        const user=new User.findOne({email});
        if(user) return res.status(400).json({error:"User already exists",sucess:false});
        const newUser=new User({name,email,password});
        newUser.password=bcrypt.hash(password,10);
        await newUser.save();
        res.status(201).json(
{
    message:"User registered successfully",
    user:newUser,
    success:true,
}
        ); 
    }catch(error){
        res.status(201).json(
            {
                message:"Internal server error",
                user:newUser,
                success:false,
            }
                    );
                 }
}
