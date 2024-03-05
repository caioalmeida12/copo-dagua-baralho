import { CardType } from "@lib/types/CardType";
import { DeckWithPilesType, DrawnCardSchema, DrawnCardType, GameStateSchema, GameStateType, NewDeckSchema, NewDeckType } from "@lib/types/GameStateType";
import GameSchema from "@lib/types/GameType";
import PlayerSchema from "@lib/types/PlayerType";
import Server from "@server/core/Server";
import GameService from "@server/services/GameService";
import { table } from "console";
import { randomUUID } from "crypto";
import { Socket } from "socket.io";


class GameController {
    createGame(socket: Socket, data: string, app: Server) {
        try {
            const game = GameSchema.parse({
                id: "111111",
                // id: Math.random().toString(36).substring(2, 8).toUpperCase(),
            });

            const player = PlayerSchema.parse({
                id: String(randomUUID()).replace(/-/g, ""),
                name: data
            });

            const gameState = GameStateSchema.parse({
                game,
                players: [player],
                isPlaying: false,
            })

            app.games.push(gameState);

            socket.emit("gameState", gameState);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while creating the game");
        }
    }

    joinGame(socket: Socket, data: { gameId: string, name: string }, app: Server) {
        try {
            const gameState: GameStateType = GameStateSchema.parse(
                app.games.find((gameState) => gameState.game.id === data.gameId)
            );

            const player = PlayerSchema.parse({
                id: String(randomUUID()).replace(/-/g, ""),
                name: data.name
            });

            const gameStateInstance = app.games.find((instance) => instance.game.id === gameState.game.id)!

            gameStateInstance.players.push(player);

            socket.emit("gameState", gameStateInstance);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while joining the game");
        }
    }

    async startGame(socket: Socket, data: { gameId: string }, app: Server) {
        try {
            const gameState: GameStateType = GameStateSchema.parse(
                app.games.find((gameState) => gameState.game.id === data.gameId)
            );

            const gameStateInstance = app.games.find((instance) => instance.game.id === gameState.game.id)!

            const deck = await GameService.getDeck(gameStateInstance.players);

            gameStateInstance.deck = deck

            const distributedCards = await GameService.distributeInitialHands(gameStateInstance);

            gameStateInstance.isPlaying = true;

            socket.emit("gameState", gameStateInstance);
            
        } catch (error) {
            console.log(error)
            socket.emit("error", "An error occurred while starting the game");
        }
    }
}

export default new GameController()