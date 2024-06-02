import { v2 as cloudinary } from "cloudinary";
import { frontendCloudinaryConfig } from "../config/cloudinaryConfig.js";

// Configure Cloudinary using the provided configuration object
cloudinary.config(frontendCloudinaryConfig);

// Export the configured Cloudinary instance
export default cloudinary;
