// controllers/aiController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "../config/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import pdf from "pdf-parse/lib/pdf-parse.js";
import fs from "fs";
// import upload from "../config/multer.js"; // ✅ multer config
import axios from "axios";
import FormData from "form-data";
// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



export const generateArticle = async (req, res) => {
  try {
    const { userId } = await req.auth(); // 👈 fix deprecation warning
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;
     console.log(req.plan);
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    // ✅ Use Gemini model instead of OpenAI completions
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: length,
        temperature: 0.7,
      },
    });

    const content = result.response.text();

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
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
    const { userId } = await req.auth(); // 👈 fix deprecation warning
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    // ✅ Use Gemini model instead of OpenAI completions
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    });

    const content = result.response.text();

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blogTitle')
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
// export const generateImage = async (req, res) => {
//   try {
//     // 1️⃣ Authenticate user
//     const { userId } = await req.auth();

//     // 2️⃣ Get prompt and publish flag
//     const { prompt, publish = false } = req.body;

//     // 3️⃣ Fetch latest user data from Clerk
//     const user = await clerkClient.users.getUser(userId);
//     let plan = user.privateMetadata?.plan || "free";
//     let free_usage = user.privateMetadata?.free_usage || 0;

//     // 4️⃣ Check access
//     if (plan !== "premium") {
//       return res.json({
//         success: false,
//         message: `Upgrade to premium. Free usage left`,
//       });
//     }

//     // 5️⃣ Prepare API request
//     const form = new FormData();
//     form.append("prompt", prompt);

//     const { data } = await axios.post(
//       "https://clipdrop-api.co/text-to-image/v1",
//       form,
//       {
//         headers: {
//           "x-api-key": process.env.CLIPDROP_API,
//           ...form.getHeaders(),
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     // 6️⃣ Convert image to Base64
//     const base64Image = `data:image/png;base64,${Buffer.from(
//       data,
//       "binary"
//     ).toString("base64")}`;

//     // 7️⃣ Upload to Cloudinary
//     const { secure_url } = await cloudinary.uploader.upload(base64Image);

//     // 8️⃣ Insert into database
//     await sql`
//       INSERT INTO creations (user_id, prompt, content, type, publish)
//       VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish})
//     `;

//     // 9️⃣ Increment free usage if not premium
//     if (plan !== "premium") {
//       await clerkClient.users.updateUser(userId, {
//         privateMetadata: { free_usage: free_usage + 1 },
//       });
//     }

//     // ✅ Return result
//     res.json({ success: true, secure_url });
//   } catch (e) {
//     console.error("❌ Error in generateImage:", e);
//     res.json({ success: false, message: "Failure in creating image" });
//   }
// };


// ========== BACKGROUND REMOVAL ==========
export const generateImage = async (req, res) => {
  try {
    // 1️⃣ Authenticate user
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 2️⃣ Get prompt and publish flag
    const { prompt, publish = false } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Prompt is required" });
    }

    // 3️⃣ Fetch latest user data from Clerk
    const user = await clerkClient.users.getUser(userId);
    let plan = user.privateMetadata?.plan || "free";
    // let free_usage = user.privateMetadata?.free_usage || 0;

    // 4️⃣ Check access
    if (plan !== "premium" ) {
      // 👈 Example: limit free users to 5 generations
      return res.json({
        success: false,
        message: `Upgrade to premium.`
      });
    }

    // 5️⃣ Prepare API request with form-data
    const form = new FormData();
    form.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
          ...form.getHeaders(), // ✅ works now (using form-data package)
        },
        responseType: "arraybuffer",
      }
    );

    // 6️⃣ Convert image to Base64
    const base64Image = `data:image/png;base64,${Buffer.from(data).toString(
      "base64"
    )}`;

    // 7️⃣ Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "quickai/images",
    });
    console.log(secure_url);
    // 8️⃣ Insert into database
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish})
    `;

    
    // ✅ Return result
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

    // Upload with background removal
    const { secure_url } = await cloudinary.uploader.upload(imagePath, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, 'Remove Background from the image', ${secure_url}, 'image', false)
    `;

    res.json({ success: true, content: secure_url });
  } catch (e) {
    console.error("❌ Error in generateImageBackGround:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove background" });
  }
};

// ========== OBJECT REMOVAL ==========
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

    // Upload original
    const { public_id } = await cloudinary.uploader.upload(imagePath);

    // Transform URL with generative remove
    const transformedUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:prompt=${object}` }],
    });

    const promptText = `Removed ${object} from image`;
    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${promptText}, ${transformedUrl}, 'image', false)
    `;

    res.json({ success: true, content: transformedUrl });
  } catch (e) {
    console.error("❌ Error in generateImageObject:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to process image object" });
  }
};

// ========== RESUME REVIEW ==========
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

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Review Resume', ${content}, 'resume')
    `;

    res.json({ success: true, content });
  } catch (e) {
    console.error("❌ Error in resumeReview:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};
