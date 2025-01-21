import express from 'express'
import {registerUser , loginUser} from '../controllers/userController/userController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js';
const router = express.Router();



router.post('/signup', registerUser);
router.post('/login', loginUser);


export default router;
