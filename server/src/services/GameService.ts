import CardSchema, { CardType } from "@lib/types/CardType";
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

        const hands = gameStateInstance.players.map((player, index) => this.drawFromTable)

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
        const drawAllCards = this.drawCardsFromDeck(gameStateInstance.deck!.deck_id, this.whatCardsShouldBeInGame(gameStateInstance.players))

        const responseCreateTablePile = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/table/add/?cards=${this.whatCardsShouldBeInGame(gameStateInstance.players)}`).then(res => res.json())
    
        const tablePileCreated = DeckWithPilesSchema.parse(responseCreateTablePile)
        
        const responseListTablePile = await fetch(`${process.env.DECK_OF_CARDS_API}${gameStateInstance.deck!.deck_id}/pile/table/list/`).then(res => res.json())

        const listedTablePile = DeckWithPilesSchema.parse(responseListTablePile)

        return listedTablePile
    }

    private async drawCardsFromDeck(deck: string, cards: string): Promise<DeckWithDrawnCardsType> {
        const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deck}/draw/?count=${cards.split(",").length}`).then(res => res.json())

        const drawnCards = DeckWithDrawnCardsSchema.parse(response)

        return drawnCards
    }

    private async drawFromTable
}

export default new GameService();