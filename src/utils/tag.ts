import mongoose from "mongoose";
import { Tag } from "../models/tag.model";

export async function resolveTagIds(tagNames: string[]): Promise<string[]> {
  for (const name of tagNames) {
    let tag = await Tag.findOne({ name });

    if (!tag) {
      tag = await Tag.create({ name });
    }
  }

  return tagNames;
}
