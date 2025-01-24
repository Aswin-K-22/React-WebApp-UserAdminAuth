import express from 'express'
const router = express.Router();
import { loginAdmin,editUser,fetchAdminData,logoutAdmin, fetchAllUsers, addUser, deleteUser } from '../controllers/adminController/adminController.js';
import { authMiddleware } from '../middlewares/adminAuthMiddleware.js';


router.post('/login',loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/users',authMiddleware, fetchAllUsers);
router.post('/editUser', authMiddleware, editUser);
router.post('/addUser' , authMiddleware ,addUser);
router.delete('/user/:id', authMiddleware, deleteUser);
router.get('/is-authenticated', authMiddleware, fetchAdminData);



export default router;