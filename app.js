import express from 'express';
import cors from 'cors';
import dotenv from  'dotenv';
import path from 'path'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;



const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// Routes
import  UserRoutes from  './routes/userRoutes.js';
app.use('/user', UserRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
