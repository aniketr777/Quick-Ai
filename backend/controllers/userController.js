import { sql } from "../config/db.js";

// 1️⃣ Get user creations
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user_id = userId.toString();
    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${user_id} ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getUserCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// 2️⃣ Get all published creations
export const getPublishedCreations = async (req, res) => {
  try {
    const userId = await req.auth();
    const creations =
      await sql`SELECT *, COALESCE(likes, '{}') as likes, COALESCE(comments, '{}') as comments FROM creations WHERE publish = true or is_public=true ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getPublishedCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    console.log("🔍 toggleLikeCreation - Request body:", req.body);
    const { userId } = await req.auth();
    console.log("🔍 toggleLikeCreation - User ID:", userId);
    const { id } = req.body;

    if (!id) {
      console.error("❌ toggleLikeCreation - No ID provided in request body");
      return res.status(400).json({ success: false, message: "Creation ID is required" });
    }

    console.log("🔍 toggleLikeCreation - Creation ID:", id);
    const [creation] = await sql`SELECT likes FROM creations WHERE id = ${id}`;

    if (!creation) {
      console.error("❌ toggleLikeCreation - Creation not found for ID:", id);
      return res
        .status(404)
        .json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes || [];
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      // User has already liked, so remove the like
      updatedLikes = currentLikes.filter((uid) => uid !== userIdStr);
      message = "Like removed";
      console.log("👎 toggleLikeCreation - Removing like for user:", userIdStr);
    } else {
      // User has not liked, so add the like
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
      console.log("👍 toggleLikeCreation - Adding like for user:", userIdStr);
    }
    await sql`UPDATE creations SET likes = ${updatedLikes} WHERE id = ${id}`;
    console.log("✅ toggleLikeCreation - Success:", message, "Total likes:", updatedLikes.length);

    res.json({ success: true, message, likes: updatedLikes });
  } catch (e) {
    console.error("❌ Error in toggleLikeCreation:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};


export const getUserPrompts = async(req,res) => {
  try {
    const { userId } = await req.auth();
    const user_id = userId.toString();
    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${user_id} AND type = 'prompt' ORDER BY created_at DESC;`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getUserPrompts:", e);
    res.status(500).json({ success: false, message: e.message });
  }
}