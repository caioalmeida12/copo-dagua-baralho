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

        const hands = await Promise.all(gameStateInstance.players.map((player, index) => this.drawFromTable(gameStateInstance.deck!.deck_id, player.id, index)))

        const distrutedHands = gameStateInstance.players.map((player, index) => {
            return {
                ...player,
                cards: hands[index].cards
            }
        })

        gameStateInstance.players = distrutedHands

        return table
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
}

export default new GameService();