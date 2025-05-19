import multer from "multer";
import { Request, Response, NextFunction } from "express";

export const upload = multer({ storage: multer.memoryStorage() });

// Custom error handler for multer errors
export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        message: "File too large. Maximum file size is 10MB.",
      });
      return;
    }
    res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
    return;
  } else if (err) {
    // An unknown error occurred - only send the message, not the entire error object
    console.error("Upload error:", err);
    res.status(400).json({
      message: err.message || "An error occurred during file upload",
    });
    return;
  }

  // Check for file validation error
  if ((req as any).fileValidationError) {
    res.status(400).json({
      message: (req as any).fileValidationError,
    });
    return;
  }

  // If no file was uploaded but one was expected
  if (!req.file && !req.files && req.method === "POST") {
    res.status(400).json({
      message: "No file uploaded or malformed request",
    });
    return;
  }

  next();
};
