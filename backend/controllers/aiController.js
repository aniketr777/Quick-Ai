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

// export const generateArticle = async (req, res) => {
//   try {
//     const { userId } = req.auth();
//     const { prompt, length } = req.body;
//     const plan = req.plan;
//     const free_usage = req.free_usage;

//     if (plan !== "premium" && free_usage >= 10) {
//       return res.json({
//         success: false,
//         message: "Limit reached. Upgrade to continue",
//       });
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: { maxOutputTokens: length, temperature: 0.7 },
//     });
//     const content = result.response.text();

//     // MODIFIED: Fetch user details
//     const { username, user_img } = await getUserDetails(userId);

//     // MODIFIED: Insert new user details into DB
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type, username, user_img)
//       VALUES (${userId}, ${prompt}, ${content}, 'article', ${username}, ${user_img})
//     `;

//     if (plan !== "premium") {
//       await clerkClient.users.updateUser(userId, {
//         privateMetadata: { free_usage: free_usage + 1 },
//       });
//     }

//     res.json({ success: true, content });
//   } catch (e) {
//     console.error("❌ Error in generateArticle:", e);
//     res.json({ success: false, message: "failure in creating" });
//   }
// };

// export const generateBlogTitle = async (req, res) => {
//   try {
//     const { userId } = await req.auth();
//     const { prompt } = req.body;
//     const plan = req.plan;
//     const free_usage = req.free_usage;

//     if (plan !== "premium" && free_usage >= 10) {
//       return res.json({
//         success: false,
//         message: "Limit reached. Upgrade to continue",
//       });
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       generationConfig: { temperature: 0.7 },
//     });
//     const content = result.response.text();

//     // MODIFIED: Fetch user details
//     const { username, user_img } = await getUserDetails(userId);

//     // MODIFIED: Insert new user details into DB
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type, username, user_img)
//       VALUES (${userId}, ${prompt}, ${content}, 'blogTitle', ${username}, ${user_img})
//     `;

//     if (plan !== "premium") {
//       await clerkClient.users.updateUser(userId, {
//         privateMetadata: { free_usage: free_usage + 1 },
//       });
//     }

//     res.json({ success: true, content });
//   } catch (e) {
//     console.error("❌ Error in generateBlogTitle:", e);
//     res.json({ success: false, message: "failure in creating" });
//   }
// };

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
    // 1. Check Auth & File
    const { userId } = req.auth();
    const resume = req.file;

    if (!resume) {
      return res.status(400).json({ success: false, message: "No resume file uploaded" });
    }

    // 2. Validate File Size (5MB)
    if (resume.size > 5 * 1024 * 1024) {
      // Clean up file if too big
      fs.unlinkSync(resume.path); 
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }

    // 3. Extract Text from PDF
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    // 4. Construct Prompt
    const prompt = `
    You are an expert Technical Recruiter and Resume Coach. 
    Analyze the resume text provided below.
    
    Return ONLY a raw JSON object with this exact schema:
    {
      "score": number (0-100),
      "atsCompatible": boolean,
      "content": string (A short, 3-4 sentence summary of the candidate's profile),
      "strengths": string[] (Top 3-4 strong points),
      "weaknesses": string[] (Top 3-4 areas for improvement),
      "keywords": string[] (Key tech stack or skills found)
    }

    Resume Text:
    "${resumeText}"
    `;

    // 5. Generate with Gemini (Using 1.5-Flash for speed and JSON adherence)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    // 6. Safe Parse
    let parsedData;
    try {
        parsedData = JSON.parse(rawResponse);
    } catch (err) {
        console.error("AI JSON Parse Failed:", rawResponse);
        return res.status(500).json({ success: false, message: "Failed to parse AI response" });
    }

    // 7. DB Storage (Uncomment and adjust to your specific DB setup)
    /*
    const { username, user_img } = await getUserDetails(userId);
    await sql`
       INSERT INTO creations (user_id, prompt, content, type, username, user_img)
       VALUES (${userId}, 'Review Resume', ${JSON.stringify(parsedData)}, 'resume', ${username}, ${user_img})
    `;
    */

    // 8. Cleanup & Response
    fs.unlinkSync(resume.path); // Delete temp file from server
    
    return res.status(200).json({
      success: true,
      ...parsedData
    });

  } catch (e) {
    console.error("❌ Error in resumeReview:", e);
    if (req.file) fs.unlinkSync(req.file.path); // Cleanup on error
    return res.status(500).json({ success: false, message: e.message });
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
        tags = ${tags},
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

// Enhance prompt by making it more detailed using Gemini
const TEXT_ENHANCEMENT_PROMPT = `You are an Expert AI Prompt Engineer and LLM Optimization Specialist. Your goal is to rewrite the user's raw request into a professional, structured prompt using the CO-STAR framework.

# INSTRUCTIONS:
1. Analyze the user's intent (Code, Writing, or Analysis).
2. Rewrite the prompt to be verbose, detailed, and structured.
dont write any thing extra , just give me the final enahcned prompt and these are some of the points u have to write about 

   - **Context:** User background or scenario.
   - **Objective:** The precise task to be done.
   - **Style:** (e.g., Professional, PEP8 Python, Academic).
   - **Tone:** (e.g., Formal, Enthusiastic, Neutral).
   - **Audience:** Who is the output for?
   - **Response:** The required format (text).

  
`;

const IMAGE_ENHANCEMENT_PROMPT = `You are an Expert AI Art Director and Visual Prompt Engineer. Your goal is to rewrite the user's concept into a highly detailed visual description optimized for image generation models (Stable Diffusion, Midjourney, DALL-E).

# INSTRUCTIONS:
1. Keep the main subject clear.
2. Add specific visual details:
   - **Medium:** (e.g., 3D Render, Oil Painting, Polaroid Photo).
   - **Lighting:** (e.g., Cinematic, Volumetric, Golden Hour, Neon).
   - **Camera:** (e.g., Wide angle, Macro, Bokeh, Drone shot).
   - **Style:** (e.g., Cyberpunk, Minimalist, Renaissance, Vaporwave).
   - **Quality:** (e.g., 8k, Hyper-realistic, Unreal Engine 5).
3. just give me the final prompt , other text is not required.

`;
export const enhancePrompt = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { prompt,type } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let  result;
    if(type==="image"){
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text:IMAGE_ENHANCEMENT_PROMPT+prompt }] }],
        generationConfig: { temperature: 0.7 },
      });
    }else{
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text:TEXT_ENHANCEMENT_PROMPT+prompt }] }],
        generationConfig: { temperature: 0.7 },
      });
    }

    // await model.generateContent({
    //   contents: [{ role: "user", parts: [{ text: `Improve and elaborate the following prompt for AI generation, making it more detailed and descriptive while preserving the core idea.\nPrompt: ${prompt}` }] }],
    //   generationConfig: { temperature: 0.7 },
    // });
    const enhanced = result.response.text();
    res.json({ success: true, enhanced });
  } catch (e) {
    console.error("❌ Error in enhancePrompt:", e);
    res.status(500).json({ success: false, message: "Failed to enhance prompt" });
  }
};


export const addComment = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { promptId, text } = req.body;

    if (!promptId || !text) {
      return res.status(400).json({ 
        success: false, 
        message: "promptId and text are required" 
      });
    }

    // Get user details for the comment
    const { username, user_img } = await getUserDetails(userId);

    // Add comment to the array in the "comments" column
    const result = await sql`
      UPDATE creations
      SET comments = array_append(comments, ${JSON.stringify({
        userId,
        username,
        author: username,
        text,
        user_img,
        created_at: new Date(),
      })})
      WHERE id = ${promptId}
      RETURNING *;
    `;

    if (!result[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Creation not found" });
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

// Get all comments for a creation
export const getComments = async (req, res) => {
  try {
    const { id } = req.params; 

    const result = await sql`
      SELECT comments
      FROM creations
      WHERE id = ${id};
    `;

    if (!result[0]) {
      return res
        .status(404)
        .json({ success: false, message: "Creation not found" });
    }

    res.json({ success: true, comments: result[0].comments || [] });
  } catch (e) {
    console.error("❌ Error in getComments:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};