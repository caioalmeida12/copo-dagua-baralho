import { GameStateSchema, GameStateType } from "@lib/types/GameStateType";
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
                id: String(randomUUID()).replace(/-/g, ""),
                name: data,
            });

            game.nextPlayer = player.id;

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

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const distributedCards = await GameService.distributeInitialHands(gameStateInstance);

            gameStateInstance.isPlaying = true;

            socket.emit("gameState", gameStateInstance);
            
        } catch (error) {
            console.log(error)
            socket.emit("error", "An error occurred while starting the game");
        }
    }

    async passCard(socket: Socket, data: { game: string, player: string, card: string }, app: Server) {
        try {
            const gameState: GameStateType = GameStateSchema.parse(
                app.games.find((gameState) => gameState.game.id === data.game)
            );

            const gameStateInstance = app.games.find((instance) => instance.game.id === gameState.game.id)!
                
            const isPlayerTurn = GameService.isPlayerTurn(gameStateInstance, data.player);

            if (!isPlayerTurn) {
                socket.emit("error", "It's not your turn");
                return;
            }

            const passTheCard = await GameService.passCard(gameStateInstance, data.player, data.card);

            socket.emit("gameState", gameStateInstance);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while passing the card");
        }
    }

    
}

export default new GameController()