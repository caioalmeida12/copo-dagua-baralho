import CardSchema, { CardType } from "@lib/types/CardType";
import { DeckWithPilesType, DrawnCardType, NewDeckType } from "@lib/types/GameStateType";

class GameService {
    generateCards(players: number): string {
        // if (players < 3) throw new Error("A game must have at least 3 players");
        if (players > 13) throw new Error("A game must have at most 13 players");

        const cardValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        const suits = ['S', 'H', 'C', 'D'];

        const cards = ["X1"];

        for (let i = 0; i < players; i++) {
            for (let k = 0; k < Number(process.env.CARDS_PER_PLAYER); k++) {
                cards.push(`${cardValues[i]}${suits[k % suits.length]}`);
            }
        }

        return cards.join(",")
    }

    async generatePartialDeck(cards: string): Promise<NewDeckType> {
        console.log(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${cards}`)
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${cards}&jokers_enabled=true`)).json()
    }

    async drawCards(deckId: string, count: number): Promise<DrawnCardType> {
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/draw/?count=${count}`)).json()
    }

    async addCardsToPile(playerId: string, playerCards: CardType[], deckId: string): Promise<DeckWithPilesType> {
        console.log(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/${playerId}/add/?cards=${playerCards.map((card) => card.code).join(",")}`)
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/${playerId}/add/?cards=${playerCards.map((card) => card.code).join(",")}`)).json()
    }

    async listCardsOfPile(playerId: string, deckId: string): Promise<CardType[]> {
        const response: DeckWithPilesType =  await (await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/${playerId}/list/`)).json()

        return response.piles[playerId].cards.map((card: CardType) => CardSchema.parse(card))
    }
}

export default new GameService();