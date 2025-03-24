import {register,login, sendPasswordReset, resetPassword, resetPasswordPage} from  "../controllers/authController.js";
import express from "express";

const router= express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/sendEmail',sendPasswordReset)
router.get('/reset-password/:token', resetPasswordPage);
router.post('/reset-password/:token', resetPassword)
export default router;