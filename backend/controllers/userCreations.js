import { sql } from "../config/db.js";

// 1️⃣ Get user creations
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getUserCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// 2️⃣ Get published creations for a user
export const getPublishedCreations = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const creations =
      await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getPublishedCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// 3️⃣ Toggle like
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;
    // console.log(creation)
    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    // Ensure likes is always an array
    let currentLikes = creation.likes || [];
    if (typeof currentLikes === "string") {
      try {
        currentLikes = JSON.parse(currentLikes);
      } catch {
        currentLikes = [];
      }
    }

    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((u) => u !== userIdStr);
      message = "Like removed";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }
    const formattedArray = `{${updatedLikes.join(", ")}}`

    await sql`UPDATE creations SET likes = ${formattedArray} WHERE id = ${id}`;

    res.json({ success: true, message, likes: updatedLikes });
  } catch (e) {
    console.error("❌ Error in toggleLikeCreation:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};



