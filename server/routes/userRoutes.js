
import { getAllUsers, deleteUser , getUserById, updateUser} from "../controllers/userController.js";
import express from "express";

const router= express.Router();

router.get('/getAll', getAllUsers);
router.delete('/:id', deleteUser);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);

export default router;