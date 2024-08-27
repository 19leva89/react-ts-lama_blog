import { promises as fsPromises } from 'fs';
import multer from "multer";
import crypto from "crypto";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';

// Get __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to generate a unique file name
const generateFilename = (originalName) => {
	const fileExtension = path.extname(originalName); // Get the file extension
	const uniqueSuffix = crypto.randomBytes(4).toString('hex'); // Generate a unique suffix
	return `${Date.now()}-${uniqueSuffix}${fileExtension}`;
};

// Configuration: MIME types and file size limit
const ALLOWED_TYPES = process.env.ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

// Setting up storage for multer
const storage = multer.diskStorage({
	destination: async function (req, file, cb) {
		try {
			const uploadPath = path.join(__dirname, 'client', 'public', 'upload');

			// Check for directory existence, create if it doesn't exist
			try {
				await fsPromises.access(uploadPath);
			} catch (error) {
				await fsPromises.mkdir(uploadPath, { recursive: true });
			}

			cb(null, uploadPath);
		} catch (error) {
			console.error(`Error while setting upload destination: ${error.message}`);
			cb(error);
		}
	},

	filename: function (req, file, cb) {
		const uniqueFilename = generateFilename(file.originalname);
		cb(null, uniqueFilename);
	},
});

// Filter files by MIME type (optional)
const fileFilter = (req, file, cb) => {
	if (ALLOWED_TYPES.includes(file.mimetype)) {
		cb(null, true); // Allow file upload
	} else {
		console.error(`File upload error: Invalid MIME type ${file.mimetype}`);
		cb(new Error('Invalid file type. Only images are allowed.'), false); // Reject the file
	}
};

// Create an instance of the multer loader
const upload = multer({
	storage: storage,
	fileFilter: fileFilter, // Optional filtering by MIME type
	limits: { fileSize: MAX_FILE_SIZE }, // Limit file size to 5MB (optional)
});

export default upload;