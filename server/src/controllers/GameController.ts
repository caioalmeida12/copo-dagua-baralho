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
            // const gameState: GameStateType = GameStateSchema.parse(
            //     app.games.find((gameState) => gameState.game.id === data.gameId)
            // );

            // const cards: string = GameService.generateCards(gameState.players.length);

            // const deck: NewDeckType = NewDeckSchema.parse(await GameService.generatePartialDeck(cards))

            // const drawnCardsWithJoker: DrawnCardType[] = await Promise.all(gameState.players.map(async () => DrawnCardSchema.parse(await GameService.drawCards(deck.deck_id, Number(process.env.CARDS_PER_PLAYER)))))
            // drawnCardsWithJoker.push(DrawnCardSchema.parse(await GameService.drawCards(deck.deck_id, 1)))

            // const drawnCards = drawnCardsWithJoker.filter((drawnCard) => drawnCard.cards[0].code !== "X1")

            // const listedCards = drawnCards.map((drawnCard) => drawnCard.cards)

            // const playerIds = app.games.find((instance) => instance.game.id === gameState.game.id)!.players.map((player) => player.id)

            // const playerWithJoker = app.games.find((instance) => instance.game.id === gameState.game.id)!.players[Math.floor(Math.random() * playerIds.length)].id
            // await GameService.addCardsToPile(playerWithJoker, [{
            //     code: "X1",
            //     value: "",
            //     image: "",
            //     images: {
            //         svg: "",
            //         png: ""
            //     },
            //     suit: "HEARTS"
            // }], deck.deck_id)

            // const piles: DeckWithPilesType[] = await Promise.all(
            //     playerIds.map(async (playerId, playerIndex) => await GameService.addCardsToPile(playerId, listedCards[playerIndex], deck.deck_id))
            // )

            // if (!piles) return socket.emit("error", "Could not add cards to piles")

            // const listedPileCards = await Promise.all(
            //     playerIds.map(async (playerId) => await GameService.listCardsOfPile(playerId, deck.deck_id))
            // )

            // if (!listedPileCards) return socket.emit("error", "Could not list cards of piles")

            // const listedPiles: { [key: string]: CardType[] }[] = playerIds.map((playerId, index) => {
            //     return {
            //         [playerId]: listedPileCards[index]
            //     }
            // })

            // if (!listedPiles) return socket.emit("error", "Could not list cards of piles")

            // console.table(listedPiles)

            // let gameStateInstance = app.games.find((instance) => instance.game.id === gameState.game.id)!

            // gameStateInstance = GameStateSchema.parse({
            //     ...gameStateInstance,
            //     isPlaying: true,
            //     table: {
            //         ...table,
            //         piles: listedPiles
            //     }
            // })

            // socket.emit("gameState", gameStateInstance);
        } catch (error) {
            console.error(error);
            socket.emit("error", "An error occurred while starting the game");
        }
    }
}

export default new GameController()