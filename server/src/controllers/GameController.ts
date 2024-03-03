import GameStateSchema from "@lib/types/GameStateType";
import GameSchema from "@lib/types/GameType";
import PlayerSchema from "@lib/types/PlayerType";
import Server from "@server/core/Server";
import GameService from "@server/services/GameService";
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
                id: randomUUID(),
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
            const game = app.games.find((game) => game.game.id === data.gameId);

            if (!game) return socket.emit("error", `A game with id [${data.gameId}] could not be found`);

            const player = PlayerSchema.parse({
                id: randomUUID(),
                name: data.name
            });

            game.players.push(player);

            socket.emit("gameState", game);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while joining the game");
        }
    }

    async startGame(socket: Socket, data: { gameId: string }, app: Server) {
        try {
            let game = app.games.find((game) => game.game.id === data.gameId);

            if (!game) return socket.emit("error", `A game with id [${data.gameId}] could not be found`);

            const cards = GameService.generateCards(game.players.length);

            const deck = GameService.generatePartialDeck(cards)

            if (!deck) return socket.emit("error", "Could not fetch a new deck from DeckOfCards API")

            game = GameStateSchema.parse({
                ...game,
                table: deck,
                isPlaying: true
            })

            socket.emit("gameState", game);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while starting the game");
        }
    }
}

export default new GameController()