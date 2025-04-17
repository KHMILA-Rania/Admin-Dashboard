import { addPartner, deletePartner, getAllPartners, getPartnerById, updatePartner } from '../controllers/partnerController.js';
import express from 'express';

const router=express.Router();

router.post("/create",addPartner);
router.delete("/:id",deletePartner);
router.patch("/:id",updatePartner);
router.get("/:id", getPartnerById);
router.get("/",getAllPartners)

export default router;