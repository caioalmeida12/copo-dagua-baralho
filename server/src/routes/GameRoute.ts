import { Router } from "express";

const gameRoute = Router();

gameRoute.get("/", (req, res) => res.status(200).json({ message: "Hello, World!" }));

export default gameRoute;
