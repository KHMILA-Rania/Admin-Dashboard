import {register,login, sendPasswordReset} from  "../controllers/authController.js";
import express from "express";

const router= express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/sendEmail',sendPasswordReset)

export default router;