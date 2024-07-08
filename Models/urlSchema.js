import mongoose from "mongoose";
import shortId from "shortid";
const urlSchema = new mongoose.Schema({
        url:{
            type:String,
            required:true
        },
        shortUrl:{
            type:String,
            
        },
        identifier:{
            type:String,
            required:true,
            default:0
        },
        currentUser:{
            type:String,
            required:true
        }
},{
    timestamps:true
})

export const Url = mongoose.model("Url", urlSchema)
export default Url