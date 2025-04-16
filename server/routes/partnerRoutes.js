import { addPartner } from '../controllers/partnerController.js';
import express from 'express';

const router=express.Router();

router.post("/create",addPartner);

export default router;