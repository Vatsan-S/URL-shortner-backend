import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
        username:{
            type:String,
            unique:true,
            required:true
        },
        firstname:{
            type:String,
            required:true
        },
        lastname:{
            type:String
        },
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        randomString:{
            type:String
        },
        activation:{
            type:Boolean,
            default:false
        }
},{
    timestamps:true
})

const User = mongoose.model("User",userSchema)
export default User