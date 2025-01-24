import express from 'express';
import cors from 'cors';
import dotenv from  'dotenv';
import fs from 'fs';
import path from 'path'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;



const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({extended: true}));




  

app.use(cookieParser());


app.use((req, res, next) => {
  const currentTime = new Date().toLocaleString(); // Format the current time
  console.log(`[${currentTime}] ${req.method} ${req.url}`);
  next();
});

// Routes
import  UserRoutes from  './routes/userRoutes.js';
import AdminRoutes from './routes/adminRoutes.js';
app.use('/user', UserRoutes);
app.use('/admin',  AdminRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
