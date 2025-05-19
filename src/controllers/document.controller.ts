import { Request, Response, RequestHandler } from "express";
import { Document } from "../models/Document";
import fs from "fs";
import ImageKit from "imagekit";
import { resolveTagIds } from "../utils/tag";
import { createWorker } from "tesseract.js";

import dotenv from "dotenv";
dotenv.config();

console.log("ImageKit private key:", process.env.IMAGEKIT_PRIVATE_KEY);

const imagekit = new ImageKit({
  publicKey: "public_KBJnpYLBDhbR732VssgGxrFIJ5A=",
  privateKey:
    process.env.IMAGEKIT_PRIVATE_KEY || "private_XSjjQpjVH11ziYGpGmmt6nK/KN8=",
  urlEndpoint: "https://ik.imagekit.io/1doc",
});

export const uploadDocument: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      content,
      tags,
      expiryDate,
      fileName,
      filePath,
      fileSize,
      created_by,
      performers,
    } = req.body;

    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const tagIds = await resolveTagIds(tags.map((p: string) => p.trim()));

    const documentData = {
      title,
      content,
      fileName,
      fileSize,
      filePath,
      performers: performers ? performers.map((p: string) => p.trim()) : [],
      tags: tagIds,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      created_by,
    };

    const newDoc = new Document(documentData);
    await newDoc.save();

    res.status(201).json({
      message: "Document created successfully",
    });
  } catch (err) {
    console.error("Upload error:", err);

    res
      .status(500)
      .json({ message: "Upload failed", error: "Internal server error" });
  }
};

export const updateDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    title,
    content,
    tags,
    expiryDate,
    fileName,
    created_by,
    performers,
    fileSize,
    filePath,
    isBlocked,
  } = req.body;

  const updateData: any = {};

  if (title) updateData.title = title;
  if (content) updateData.content = content;

  if (tags) {
    const tagIds = await resolveTagIds(tags.map((p: string) => p.trim()));
    updateData.tags = tagIds;
  }

  if (expiryDate) updateData.expiryDate = new Date(expiryDate);
  if (created_by) updateData.created_by = created_by;
  if (performers) {
    updateData.performers = performers
      ? performers.map((p: string) => p.trim())
      : [];
  }

  if (fileName) updateData.fileName = fileName;
  if (fileSize) updateData.fileSize = fileSize;
  if (filePath) updateData.filePath = filePath;
  if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

  try {
    const document = await Document.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!document) {
      res.status(404).json({ message: "Document not found" });

      return;
    }

    res.status(200).json({
      message: "Document updated successfully",
      document,
    });
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const OCRUploadDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/documents",
    });

    let content = "";

    // OCR start
    if (uploadResponse.fileType === "image") {
      const worker = await createWorker({
        logger: (m) => console.log(m), // optional: logs progress
      });

      await worker.load(); // Load worker
      await worker.loadLanguage("eng"); // Load English language data
      await worker.initialize("eng"); // Initialize with language

      const { data } = await worker.recognize(uploadResponse.url); // Perform OCR
      content = data.text;

      await worker.terminate(); // Clean up

      res.status(200).json({
        message: "OCR completed successfully",
        content,
        fileName: file.originalname,
        fileSize: file.size,
        filePath: uploadResponse.url,
      });
    } else {
      res.status(200).json({
        message: "File type not supported for OCR",
        fileType: uploadResponse.fileType,
        fileName: file.originalname,
        fileSize: file.size,
        filePath: uploadResponse.url,
      });
      return;
    }

    // OCR end
  } catch (err) {
    console.error("Upload error:", err);
    res
      .status(500)
      .json({ message: "Upload failed", error: "Internal server error" });
  }
};

/**
 * Get all documents (optionally filtered by status, tags, etc.)
 */
export const getAllDocuments: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { status, tag, search } = req.query;

  const filter: Record<string, any> = {};

  if (status) {
    filter.status = status;
  }

  if (tag) {
    filter.tags = { $in: tag };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const documents = await Document.find(filter).populate("tags");

    res.status(200).json(documents);
  } catch (err) {
    console.error("Error fetching documents:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a specific document by ID
 */
export const getDocumentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id)
      .populate("tags")
      .populate("created_by");

    if (!document) {
      res.status(404).json({ message: "Document not found" });

      return;
    }

    res.status(200).json(document);
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a document by ID
 */
export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      res.status(404).json({ message: "Document not found" });

      return;
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Block or unblock a document
 */
export const blockDocument = async (req: Request, res: Response) => {};
