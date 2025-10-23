import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getUserCreations,
  getPublishedCreations,
  toggleLikeCreation,
  getUserPrompts
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/user-creations", auth, getUserCreations);


userRouter.get("/published-creations", getPublishedCreations);

userRouter.post("/toggle-like", auth, toggleLikeCreation);


userRouter.get("/get-user-prompts",auth, getUserPrompts);
export default userRouter;
