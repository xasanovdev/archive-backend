// models/tag.model.ts
import mongoose, { Schema } from "mongoose";

export interface ITag {
  name: string;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true },
});

const Tag = mongoose.model<ITag>("Tag", TagSchema);
export { Tag };
