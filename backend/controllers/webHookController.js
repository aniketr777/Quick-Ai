
import { Webhook } from "svix";
import { sql } from "../config/db.js";

export const handleClerkWebhook = async (req, res) => {

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  const headers = req.headers;
  const payload = JSON.stringify(req.body);
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Error occurred -- no svix headers" });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({ Error: err.message });
  }

  // 2. Handle the 'user.updated' event
  const { id, image_url, first_name, last_name, username } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.updated") {
    console.log(`User ${id} was updated`);

    const newUsername = first_name
      ? `${first_name} ${last_name || ""}`.trim()
      : username;
    const newUserImg = image_url;

    // 3. Update all creations for that user in your database
    try {
      await sql`
        UPDATE creations
        SET username = ${newUsername}, user_img = ${newUserImg}
        WHERE user_id = ${id}
      `;
      console.log(`Updated creations for user ${id}`);
    } catch (dbError) {
      console.error("Database update failed:", dbError);
    }
  }

  res.status(200).json({ response: "Success" });
};
