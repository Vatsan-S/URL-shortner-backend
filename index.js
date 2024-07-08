import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from "./Databse/config.js";
import userRouter from './Routers/userRouter.js'
dotenv.config()

const app = express();


//middleware section
app.use(express.json())
app.use(cors({
    origin:'*',
    credentials:true
}))
app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    res.status(statusCode).json({
        success:failure,
        statusCode,
        message
    })
})

//Database connection string
connectDB()


//router section
app.get('/',(req,res)=>{
    res.status(200).send("This is a URL shortner api")
})
app.use("/api/user",userRouter)



//listening port
app.listen(process.env.PORT,()=>{
    console.log("Server listening on port")
})