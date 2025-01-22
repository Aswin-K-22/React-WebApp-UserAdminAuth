import express from 'express'
import {registerUser , loginUser, fetchUserData, logoutUser, uploadProfilePic, deleteProfilePic} from '../controllers/userController/userController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();



router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.post('/profile-pic' , authMiddleware , uploadProfilePic)
router.delete('/profile-pic', authMiddleware, deleteProfilePic);


router.get('/is-authenticated', authMiddleware, fetchUserData);

export default router;
