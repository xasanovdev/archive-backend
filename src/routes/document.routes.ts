import express, { Router } from "express";
import {
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  blockDocument,
  uploadDocument,
  updateDocument,
  OCRUploadDocument,
} from "../controllers/document.controller";
import { upload, handleUploadError } from "../middlewares/upload.middleware";

const router: Router = express.Router();

// Upload a new document
router.post("/upload/", uploadDocument);

router.post(
  "/ocr",
  upload.single("file"),
  handleUploadError,
  OCRUploadDocument
);

// Get all documents (with optional filters)
router.get("/", getAllDocuments);

// Get a specific document
router.get("/:id", getDocumentById);

// Delete a document
router.delete("/:id", deleteDocument);

// Block or unblock a document
router.patch("/:id/block", blockDocument);

// Update a document
router.put("/:id", updateDocument);

// Update a document
router.patch("/:id", updateDocument);

export default router;
