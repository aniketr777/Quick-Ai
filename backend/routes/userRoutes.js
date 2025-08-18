import express from "express";


import {auth} from "../middleware/auth.js" 
import {getUserCreations , getPublishedCreations, toggleLikeCreation} from "../controllers/userCreations.js"
const userRouter = express.Router();

userRouter.get("/getUserCreations",auth,getUserCreations)
userRouter.get("/getPublishedCreations", auth, getPublishedCreations);

userRouter.post("/toggle-like-creation", auth, toggleLikeCreation);

export default userRouter
