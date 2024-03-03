import GameStateSchema from "@lib/types/GameStateType";
import GameSchema from "@lib/types/GameType";
import PlayerSchema from "@lib/types/PlayerType";
import Server from "@server/core/Server";
import { randomUUID } from "crypto";
import { Socket } from "socket.io";

export class GameController {
    public static handleEvent(socket: Socket, app: Server) {
        const instance = new GameController();

        instance.createGame(socket, app);
        instance.joinGame(socket, app);
        instance.startGame(socket, app);
    }

    private createGame(socket: Socket, app: Server) {
        socket.on("createGame", (data: { name: string }) => {
            const game = GameSchema.parse({
                id: Math.random().toString(36).substring(2, 8).toUpperCase(),
            });

            const player = PlayerSchema.parse({
                id: randomUUID(),
                name: data.name
            });

            const gameState = GameStateSchema.parse({
                game,
                players: [player],
                isPlaying: false
            })

            app.games.push(gameState);

            socket.emit("gameState", gameState);
        });
    }

    private joinGame(socket: Socket, app: Server) {
        socket.on("joinGame", (data: { gameId: string, name: string }) => {
            const game = app.games.find((game) => game.game.id === data.gameId);

            if (!game) return socket.emit("gameNotFound");

            const player = PlayerSchema.parse({
                id: randomUUID(),
                name: data.name
            });

            game.players.push(player);

            socket.emit("gameState", game);
        });
    }

    private startGame(socket: Socket, app: Server) {
        socket.on("startGame", (data: { gameId: string }) => {
            const game = app.games.find((game) => game.game.id === data.gameId);

            if (!game) return socket.emit("gameNotFound");

            game.isPlaying = true;

            socket.emit("gameState", game);
        });
    }
}

