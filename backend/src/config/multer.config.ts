import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Multer Configuration for File Uploads
 * 
 * Configures file storage, naming, size limits, and file type filtering
 * Supports: PDF, DOC, DOCX, TXT, PPTX, PPT, JPG, PNG, GIF
 * Max file size: 10MB
 */
const uploadsDir = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer configuration options for file uploads
 * 
 * Used with FileInterceptor in controllers
 */
export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      cb(null, `file-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|pptx|ppt/;
    const ext = extname(file.originalname).toLowerCase().replace('.', '');
    const isValid = allowedTypes.test(ext);

    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, PPTX, PPT, JPG, PNG, and GIF files are allowed!'));
    }
  },
};

