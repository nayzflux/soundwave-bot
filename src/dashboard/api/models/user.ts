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
    },
    // Account Spotify
    spotifyCredentials: {
        access_token: String,
        token_type: String,
        scope: String,
        expires_at: Number,
        expires_in: Number,
        refresh_token: String,
    }
});

const User = model("User", userSchema, "users");
export default User;