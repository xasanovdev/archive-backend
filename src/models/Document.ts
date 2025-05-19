import mongoose, { Schema } from "mongoose";

interface IDocument {
  title: string;
  content?: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  performers: string[];
  tags: string[];
  expiryDate: Date | null;
  created_by: string;
  isBlocked?: boolean;
}

const DocumentSchema = new Schema<IDocument>({
  title: { type: String, required: true },
  content: { type: String, required: false },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  performers: { type: [String], required: true },
  tags: { type: [String], required: true },
  isBlocked: { type: Boolean, default: false },
  expiryDate: { type: Date, default: null },
  created_by: { type: String, required: true },
});

const Document = mongoose.model<IDocument>("Document", DocumentSchema);

export { Document, IDocument };
