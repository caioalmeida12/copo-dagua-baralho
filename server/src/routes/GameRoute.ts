import GameController from "@server/controllers/GameController";
import Server from "@server/core/Server";
import { Socket } from "socket.io";

export class GameRouter {
    public static handleEvent(socket: Socket, app: Server) {
        const instance = new GameRouter();

        instance.createGame(socket, app);
        instance.joinGame(socket, app);
        instance.startGame(socket, app);
    }

    private createGame(socket: Socket, app: Server) {
        socket.on("createGame", (data) => GameController.createGame(socket, data, app));
    }

    private joinGame(socket: Socket, app: Server) {
        socket.on("joinGame", (data) => GameController.joinGame(socket, data, app));
    }

    private startGame(socket: Socket, app: Server) {
        socket.on("startGame", (data) => GameController.startGame(socket, data, app));
    }
}

