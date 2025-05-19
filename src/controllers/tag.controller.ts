import { Request, Response } from "express";
import { Tag } from "../models/tag.model";

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find();

    res.status(200).json(tags);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};
