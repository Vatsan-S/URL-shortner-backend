import express from "express";
import { activation, extract_url, fetch_url, forgotpasssword, generate_url, login, register, resetpassword } from "../Controllers/userController.js";


const router = express.Router()


router.post("/register", register)
router.post("/activation", activation)
router.post('/login', login)
router.post('/forgot_password', forgotpasssword)
router.post("/reset_password",resetpassword)



router.post('/generate_url', generate_url)
router.get('/:shortkey',extract_url)
router.post('/fetch_url',fetch_url)
export default router