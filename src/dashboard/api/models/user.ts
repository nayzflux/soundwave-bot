import { Schema, model } from "mongoose";

const userSchema = new Schema({
    id: String,
    email: String,
    username: String,
    credentials: {
        access_token: String,
        refresh_token: String,
        expires_in: String,
        updated_at: String,
    }
});
const User = model("User", userSchema, "users");
export default User;