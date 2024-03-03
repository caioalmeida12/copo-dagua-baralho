import express from "express";

import morgan from "morgan";

import { createServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import path from "path";

import { GameStateType } from "@lib/types/GameStateType";
import { GameRouter } from "@server/routes/GameRoute";

class Server {
    public app: express.Application;
    public port: number;
    private httpServer;
    private io: SocketIOServer;
    public games: Array<GameStateType>;

    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT);
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer);
        this.games = []

        if (process.env.NODE_ENV === "development") this.app.use(morgan("dev"));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, 'public')));

        this.io.on("connection", (socket: Socket) => GameRouter.handleEvent(socket, this));

        this.app.use("/", (req, res) => {
            return res.sendFile("index.html", { root: "public" });
        })

        this.app.use("/health", (_req, res) => res.status(200).json({ status: "OK" }));
    }

    start(callback: () => void): void {
        this.httpServer.listen(this.port, callback);
    }
}
export default Server;