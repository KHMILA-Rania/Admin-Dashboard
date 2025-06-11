import express from 'express';
import {Contact } from '../controllers/contactUsController.js';

const router = express.Router();

router.post('/add', Contact);


export default router;
