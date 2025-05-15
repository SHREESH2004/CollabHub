import express from "express";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import userRoutes from "./routes/user.routes.js"
import projectRoutes from "./routes/project.routes.js"
import aiRoutes from "./routes/ai.routes.js"
import morgan from "morgan";
import cors from "cors"
configDotenv();
const app=express();
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true, 
  }));
app.use(morgan('dev'))

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.use('/users',userRoutes);
app.use('/project',projectRoutes);
app.use('/ai',aiRoutes);
export default app;