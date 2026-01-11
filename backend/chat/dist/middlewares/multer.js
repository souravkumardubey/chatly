import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "chatly-images",
        allowed_formats: ["png", "jpg", "jpeg", "webp", "gif"],
        transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
        ],
    },
});
export const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type. Only images are allowed."));
        }
    },
});
