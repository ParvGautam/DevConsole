import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" })); // to parse req.body
// limit shouldn't be too high to prevent DOS
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)

app.use(cookieParser());
app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (such as mobile apps, curl, server-to-server)
		if (!origin) return callback(null, true);

		// Allow localhost, all vercel deployments (production & preview branches), and netlify
		if (
			origin.startsWith("http://localhost:") ||
			origin.startsWith("http://127.0.0.1:") ||
			origin.endsWith(".vercel.app") ||
			origin.endsWith(".netlify.app")
		) {
			return callback(null, true);
		}

		return callback(null, false);
	},
	credentials: true
}));


// Ensure database connection before routing requests (essential for serverless invocations)
app.use(async (req, res, next) => {
	try {
		await connectMongoDB();
		next();
	} catch (err) {
		console.error("Database connection failed:", err.message);
		res.status(500).json({ error: "Database connection failed" });
	}
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
	res.send("DevConsole Backend API is running");
});

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}

export default app;
