import { Router } from "express";

const gameRoute = Router();

gameRoute.get("/", (req, res) => {
    return res.sendFile("index.html", { root: "public" });
});

export default gameRoute;
