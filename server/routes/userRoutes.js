
import { getAllUsers, deleteUser , getUserById, updateUser} from "../controllers/userController.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router= express.Router();

router.get('/getAll', getAllUsers);
router.delete('/:id', deleteUser);
router.get('/:id',verifyToken, getUserById);
router.patch('/:id', updateUser);

export default router;