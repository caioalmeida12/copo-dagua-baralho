import { CardType } from "@lib/types/CardType";
import { DeckWithPilesType, DrawnCardType, NewDeckType } from "@lib/types/GameStateType";

class GameService {
    generateCards(players: number): string {
        if (players < 3) throw new Error("A game must have at least 3 players");
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
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${cards}`)).json()
    }

    async drawCards(deckId: string, count: number): Promise<DrawnCardType> {
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/draw/?count=${count}`)).json()
    }

    async addCardsToPile(playerAndCards: { id: string, name: string, cards: CardType[], deckId: string }): Promise<DeckWithPilesType> {
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}${playerAndCards.deckId}/pile/${playerAndCards.id}/add/?cards=${playerAndCards.cards.map((card) => card.code).join(",")}`)).json()
    }
}

export default new GameService();