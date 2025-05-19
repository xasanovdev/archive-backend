import express, { Router } from "express";
import { getAllTags } from "../controllers/tag.controller";

const router: Router = express.Router();

router.get("/", getAllTags);

export default router;
