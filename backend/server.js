import  express from "express"
import  dotenv from "dotenv"
dotenv.config();
import  cors from "cors"
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";


const app = express();
app.use(express.json())
app.use(clerkMiddleware());
await connectCloudinary();
app.use(cors());



app.get("/", (req, res) => {
  res.send("hi there");
 

});

app.use('/api/ai',aiRouter)
app.use('/api/user',userRouter)


const PORT =  process.env.PORT || 5000;
app.listen(PORT, (req, res) => {
  console.log(`Server running on Port ${5000} `);
});
