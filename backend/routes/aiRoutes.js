import express from "express";
import { generateArticle, generateBlogTitle, generateImage, generateImageBackGround, generateImageObject, resumeReview } from "../controllers/aiController.js";
import {auth} from "../middleware/auth.js" 
import upload from "../config/multer.js";
const aiRouter = express.Router();


aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-image", auth, generateImage);

aiRouter.post("/generate-image-backgorund", auth,upload.single('image'), generateImageBackGround);
aiRouter.post(
  "/generate-image-object",
  auth,
  upload.single("image"),
  generateImageObject
);

aiRouter.post(
  "/generate-resume-review",upload.single('resume'),
  auth,
 resumeReview
);
export default aiRouter;
