import { DeckWithPilesType, DrawnCardSchema, DrawnCardType, GameStateSchema, GameStateType, NewDeckSchema, NewDeckType } from "@lib/types/GameStateType";
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

            const cards: string = GameService.generateCards(gameState.players.length);

            const deck: NewDeckType = NewDeckSchema.parse(await GameService.generatePartialDeck(cards))

            const drawnCards: DrawnCardType[] = await Promise.all(gameState.players.map(async () => DrawnCardSchema.parse(await GameService.drawCards(deck.deck_id, Number(process.env.CARDS_PER_PLAYER)))))

            const playersAndCards = gameState.players.map((player, index) => {
                return {
                    ...player,
                    cards: drawnCards[index].cards,
                    deckId: deck.deck_id
                }
            })

            const piles: DeckWithPilesType[] = await Promise.all(
                playersAndCards.map(async (playerAndCards) => await GameService.addCardsToPile(playerAndCards))
            )

            if (!piles) return socket.emit("error", "Could not add cards to piles")

            let gameStateInstance = app.games.find((instance) => instance.game.id === gameState.game.id)!

            gameStateInstance = GameStateSchema.parse({
                ...gameStateInstance,
                isPlaying: true,
                table: piles.at(-1)
            })

            socket.emit("gameState", gameStateInstance);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while starting the game");
        }
    }
}

export default new GameController()