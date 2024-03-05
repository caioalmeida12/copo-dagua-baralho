import { CardType } from "@lib/types/CardType";
import { DeckWithPilesType, DrawnCardType as DeckWithDrawnCardsType, GameStateType, NewDeckSchema, NewDeckType, DrawnCardSchema as DeckWithDrawnCardsSchema, DeckWithPilesSchema } from "@lib/types/GameStateType";
import { PlayerType } from "@lib/types/PlayerType";

class GameService {
    async getDeck(players: PlayerType[]): Promise<NewDeckType> {
        const response = await fetch(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${this.whatCardsShouldBeInGame(players)}&jokers_enabled=true`).then(res => res.json())

        const deck = NewDeckSchema.parse(response)

        return deck
    }

    async distributeInitialHands(gameStateInstance: GameStateType): Promise<DeckWithPilesType> {
        const table = await this.makeTablePile(gameStateInstance)

        const createPiles = await this.makeAllPlayerPiles(gameStateInstance)

        const listPiles = await this.listPilesForAllPlayers(gameStateInstance)

        // console.table(listPiles.map(pile => pile.map(card => card.code)))

        const distrutedHands = gameStateInstance.players.map((player, index) => {
            return {
                ...player,
                cards: listPiles[index]
            }
        })

        gameStateInstance.players = distrutedHands

        return table
    }

    isPlayerTurn(gameStateInstance: GameStateType, playerId: string): boolean {
        if (!gameStateInstance.game.nextPlayer) gameStateInstance.game.nextPlayer = gameStateInstance.players[0].id

        return gameStateInstance.game.nextPlayer === playerId
    }

    async passCard(gameStateInstance: GameStateType, playerId: string, card: string): Promise<GameStateType> {
        const playerIndex = gameStateInstance.players.findIndex((player) => player.id === playerId)
        const player = gameStateInstance.players[playerIndex]

        if (playerIndex === -1) throw new Error("Player not found")

        const returnCardFromPlayer = await this.returnCardFromPileToTable(gameStateInstance.deck!.deck_id, player.id, card)

        // console.log(this.listPileForPlayer(gameStateInstance, player))

        const nextPlayerId = gameStateInstance.players[(playerIndex + 1) % gameStateInstance.players.length].id

        gameStateInstance.game.nextPlayer = nextPlayerId

        return gameStateInstance
    }

    private whatCardsShouldBeInGame(players: PlayerType[]): string {
        const allCardCodes = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
        const suits = ['S', 'H', 'C', 'D'];

        const cardCodesInGame = ["X1"]

        for (let i = 0; i < players.length; i++) {
            for (let k = 0; k < Number(process.env.CARDS_PER_PLAYER); k++) {
                cardCodesInGame.push(`${allCardCodes[i]}${suits[k % suits.length]}`);
            }
        }

        return cardCodesInGame.join(",")
    }

    private async makeTablePile(gameStateInstance: GameStateType): Promise<DeckWithPilesType> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const drawAllCards = this.drawCardsFromDeck(gameStateInstance.deck!.deck_id, this.whatCardsShouldBeInGame(gameStateInstance.players))

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const responseCreateTablePile = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/table/add/?cards=${this.whatCardsShouldBeInGame(gameStateInstance.players)}`).then(res => res.json())

        const responseTablePileShuffled = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/table/shuffle/`).then(res => res.json())

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tablePileCreated = DeckWithPilesSchema.parse(responseTablePileShuffled)

        const responseListTablePile = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/table/list/`).then(res => res.json())

        const listedTablePile = DeckWithPilesSchema.parse(responseListTablePile)

        return listedTablePile
    }

    private async makeAllPlayerPiles(gameStateInstance: GameStateType): Promise<DeckWithPilesType[]> {
        const createPiles = gameStateInstance.players.map(async (player) => {
            const cards = await this.drawFromTable(gameStateInstance.deck!.deck_id, player.id, gameStateInstance.players.findIndex(p => p.id === player.id))

            const cardsString = cards.cards.map(card => card.code).join(",")

            const pile = await this.makePileForPlayer(gameStateInstance, player, cardsString)

            return pile
        })

        const piles = await Promise.all(createPiles)

        return piles
    }

    private async makePileForPlayer(gameStateInstance: GameStateType, player: PlayerType, cards: string): Promise<DeckWithPilesType> {
        const cardsArray = cards.split(",");
        const responseCreatePile = [];
        for (const card of cardsArray) {
            c24onsole.log(card)

            const response = fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/${player.id}/add/?cards=${card}`).then(res => res.json());
            responseCreatePile.push(response);
        }
        
        const pileCreated = DeckWithPilesSchema.parse((await Promise.all(responseCreatePile)).at(-1))
        
        console.log(pileCreated.piles)

        return pileCreated
    }

    private async listPilesForAllPlayers(gameStateInstance: GameStateType): Promise<CardType[][]> {
        const listPiles = gameStateInstance.players.map(async (player) => {
            const pile = await this.listPileForPlayer(gameStateInstance, player)

            return pile
        })

        const piles = await Promise.all(listPiles)

        return piles
    }

    private async listPileForPlayer(gameStateInstance: GameStateType, player: PlayerType): Promise<CardType[]> {
        const responseListPile = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/${player.id}/list/`).then(res => res.json())

        const listedPile = DeckWithPilesSchema.required({ piles: true }).parse(responseListPile)

        return listedPile.piles[player.id].cards!
    }



    private async drawCardsFromDeck(deck: string, cards: string): Promise<DeckWithDrawnCardsType> {
        const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deck}/draw/?count=${cards.split(",").length}`).then(res => res.json())

        const drawnCards = DeckWithDrawnCardsSchema.parse(response)

        return drawnCards
    }

    private async drawFromTable(deck: string, player: string, index: number): Promise<DeckWithDrawnCardsType> {
        const cardsForThisPlayer = (index === 0) ? Number(process.env.CARDS_PER_PLAYER) + 1 : Number(process.env.CARDS_PER_PLAYER)

        const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deck}/pile/table/draw/?count=${cardsForThisPlayer}`).then(res => res.json())

        const drawnCards = DeckWithDrawnCardsSchema.parse(response)

        return drawnCards
    }

    private async returnCardFromPileToTable(deck: string, pile: string, card: string): Promise<DeckWithDrawnCardsType> {
        const responseReturn = await fetch(`${process.env.DECK_OF_CARDS_API}${deck}/pile/${pile}/return/?cards=${card}`).then(res => res.json())

        const returnedCard = DeckWithDrawnCardsSchema.parse(responseReturn)

        const addToTablePile = await this.drawCardsFromDeck(deck, card)

        return addToTablePile
    }
}

export default new GameService();