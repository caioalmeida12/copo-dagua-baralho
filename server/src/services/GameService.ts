class GameService {
    generateCards(players: number) {
        if (players < 3) throw new Error("A game must have at least 3 players");
        if (players > 13) throw new Error("A game must have at most 13 players");

        const cardValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

        const cards = ["X1"];

        for (let p = 0; p <= players - 1; p++) {
            cards.push(`${cardValues[p]}S,${cardValues[p]}S,${cardValues[p]}H,${cardValues[p]}H,${cardValues[p]}C,${cardValues[p]}H`)
        }

        return cards.join(",")
    }

    async generatePartialDeck(cards: string) {
        return await (await fetch(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${cards}`)).json()
    }
}

export default new GameService();