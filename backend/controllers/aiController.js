// controllers/aiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "../config/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import pdf from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const getUserDetails = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    const username = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.username;
    const user_img = user.imageUrl;
    return { username, user_img };
  } catch (error) {
    console.error("Error fetching user from Clerk:", error);
    // Return defaults if user fetch fails
    return { username: "Anonymous", user_img: null };
  }
};

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: length, temperature: 0.7 },
    });
    const content = result.response.text();

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, username, user_img)
      VALUES (${userId}, ${prompt}, ${content}, 'article', ${username}, ${user_img})
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (e) {
    console.error("❌ Error in generateArticle:", e);
    res.json({ success: false, message: "failure in creating" });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    });
    const content = result.response.text();

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, username, user_img)
      VALUES (${userId}, ${prompt}, ${content}, 'blogTitle', ${username}, ${user_img})
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUser(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (e) {
    console.error("❌ Error in generateBlogTitle:", e);
    res.json({ success: false, message: "failure in creating" });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { prompt, publish = false } = req.body;
    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }
    const user = await clerkClient.users.getUser(userId);
    let plan = user.privateMetadata?.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: `Upgrade to premium.`,
      });
    }

    const form = new FormData();
    form.append("prompt", prompt);
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
          ...form.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );
    const base64Image = `data:image/png;base64,${Buffer.from(data).toString(
      "base64"
    )}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "quickai/images",
    });

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, username, user_img)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish}, ${username}, ${user_img})
    `;

    res.json({ success: true, secure_url, plan });
  } catch (e) {
    console.error("❌ Error in generateImage:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

export const generateImageBackGround = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    }
    const imagePath = file.path;
    const plan = req.plan || "free";
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium members",
      });
    }
    const { secure_url } = await cloudinary.uploader.upload(imagePath, {
      transformation: [{ effect: "background_removal" }],
    });

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, username, user_img)
      VALUES (${userId}, 'Remove Background from the image', ${secure_url}, 'image', false, ${username}, ${user_img})
    `;

    res.json({ success: true, content: secure_url });
  } catch (e) {
    console.error("❌ Error in generateImageBackGround:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove background" });
  }
};

export const generateImageObject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { object } = req.body;
    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "No image uploaded" });
    if (!object)
      return res
        .status(400)
        .json({ success: false, message: "No object specified to remove" });

    const imagePath = file.path;
    const plan = req.plan || "free";
    if (plan !== "premium") {
      return res.status(403).json({
        success: false,
        message: "This feature is only available for premium members",
      });
    }
    const { public_id } = await cloudinary.uploader.upload(imagePath);
    const transformedUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:prompt=${object}` }],
    });

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);
    const promptText = `Removed ${object} from image`;

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, username, user_img)
      VALUES (${userId}, ${promptText}, ${transformedUrl}, 'image', false, ${username}, ${user_img})
    `;

    res.json({ success: true, content: transformedUrl });
  } catch (e) {
    console.error("❌ Error in generateImageObject:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to process image object" });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const resume = req.file;
    if (!resume) {
      return res
        .status(400)
        .json({ success: false, message: "No resume file uploaded" });
    }
    const plan = req.plan || "free";
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is available for premium members only",
      });
    }
    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB)",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas of improvement:\n\n${pdfData.text}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });
    const content =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No feedback generated.";

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, username, user_img)
      VALUES (${userId}, 'Review Resume', ${content}, 'resume', ${username}, ${user_img})
    `;

    res.json({ success: true, content });
  } catch (e) {
    console.error("❌ Error in resumeReview:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

export const createPrompt = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { heading, prompt, tags, isPublic, type } = req.body;

    if (!heading || !prompt || !tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Heading, prompt, and at least one tag are required.",
      });
    }

    // MODIFIED: Fetch user details
    const { username, user_img } = await getUserDetails(userId);

    // MODIFIED: Insert new user details into DB
    await sql`
      INSERT INTO creations (user_id, title, prompt , content , type, tags, is_public, username, user_img)
      VALUES (${userId}, ${heading}, ${prompt},${prompt},${type}, ${tags}, ${isPublic}, ${username}, ${user_img})
      RETURNING *`;

    res.status(201).json({ success: true });
  } catch (e) {
    console.error("❌ Error in createPrompt:", e);
    res.status(500).json({ success: false, message: "Failed to save prompt." });
  }
};


export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    // Changed 'creations' to 'prompts'
    const result = await sql`DELETE FROM creations WHERE id = ${id}`;
    
    if (result.count === 0)
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });
    
    res.json({ success: true, message: "Prompt deleted" });
  } catch (e) {
    console.error("❌ Error in deletePrompt:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete prompt" });
  }
};



export const likePrompt = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { promptId } = req.body;

    // Changed 'creations' to 'prompts'
    const [updated] = await sql`
      UPDATE creations
      SET likes = CASE
          WHEN ${userId} = ANY(likes) THEN array_remove(likes, ${userId})
          ELSE array_append(likes, ${userId})
        END,
        updated_at = now()
      WHERE id = ${promptId}
      RETURNING id, likes
    `;

    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found" });

    res.json({
      success: true,
      message: updated.likes.includes(userId)
        ? "Prompt liked"
        : "Prompt unliked",
      likes: updated.likes.length,
    });
  } catch (e) {
    console.error("❌ Error in likePrompt:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to like/unlike prompt" });
  }
};

export const editPrompt = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "id is required." });
    }

    const creation = await sql`
      SELECT * FROM creations 
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!creation || creation.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Prompt not found." });
    }

    const { heading, prompt, tags, isPublic } = req.body;

    if (!heading || !prompt || !tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Heading, prompt and at least one tag are required.",
      });
    }

    const updated = await sql`
      UPDATE creations 
      SET 
        title = ${heading},
        prompt = ${prompt},
        content = ${prompt},
        tags = ${sql.array(tags, "text")},
        is_public = ${isPublic},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      success: true,
      message: "Prompt updated successfully.",
      data: updated[0],
    });
  } catch (e) {
    console.error("❌ Error in editPrompt:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to update prompt." });
  }
};


export const addComment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.params; // id of the post/item
    const { text } = req.body; // new comment content

    // Add comment to the array in the "comments" column
    const result = await sql`
      UPDATE posts
      SET comments = array_append(comments, ${JSON.stringify({
        userId,
        text,
        created_at: new Date(),
      })})
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!result[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({
      success: true,
      message: "Comment added successfully",
      data: result[0],
    });
  } catch (e) {
    console.error("❌ Error in addComment:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params; 

    const result = await sql`
      SELECT comments
      FROM posts
      WHERE id = ${id};
    `;

    if (!result[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, comments: result[0].comments });
  } catch (e) {
    console.error("❌ Error in getComments:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};