import { sql } from "../config/db.js";

// 1️⃣ Get user creations
export const getUserCreations = async (req, res) => {
  try {
    const { userId } = await req.auth();
    // console.log(userId)
    const user_id = userId.toString();
    // console.log(user_id)
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
    // req.auth() is used here to ensure the user is authenticated to see community creations
    const userId = await req.auth();
    const creations =
      await sql`SELECT * FROM creations WHERE publish = true or is_public=true ORDER BY created_at DESC`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getPublishedCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};

// 3️⃣ Toggle like on a creation
export const toggleLikeCreation = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const [creation] = await sql`SELECT likes FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res
        .status(404)
        .json({ success: false, message: "Creation not found" });
    }

    // The database driver automatically converts TEXT[] to a JS array.
    // If 'likes' is null, default to an empty array.
    const currentLikes = creation.likes || [];
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      // User has already liked, so remove the like
      updatedLikes = currentLikes.filter((uid) => uid !== userIdStr);
      message = "Like removed";
    } else {
      // User has not liked, so add the like
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation liked";
    }

    // The `sql` helper automatically converts the JS array to the correct PostgreSQL format
    await sql`UPDATE creations SET likes = ${updatedLikes} WHERE id = ${id}`;

    res.json({ success: true, message, likes: updatedLikes });
  } catch (e) {
    console.error("❌ Error in toggleLikeCreation:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};



export const getUserPrompts =async(req,res) =>{
  try {
    const { userId } = await req.auth();
    const user_id = userId.toString();
    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${user_id} AND type = 'prompt' ORDER BY created_at DESC;`;
    res.json({ success: true, creations });
  } catch (e) {
    console.error("❌ Error in getUserCreations:", e);
    res.status(500).json({ success: false, message: e.message });
  }
}