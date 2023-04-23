import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Dashboard API: Connected to DB");
    }).catch(() => {
        console.log("Dashboard API: Unable to connected to DB");
    });