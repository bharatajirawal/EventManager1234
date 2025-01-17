const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
})
const UserModels=mongoose.model('user',UserSchema);
console.log(UserModels);
module.exports = UserModels;