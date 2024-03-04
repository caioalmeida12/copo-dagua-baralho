import CardSchema, { CardType } from "@lib/types/CardType";
import { DeckWithPilesType, DrawnCardType, NewDeckType } from "@lib/types/GameStateType";
import { PlayerType } from "@lib/types/PlayerType";

class GameService {
    /**
     * Retrieves a new deck of cards for the specified players.
     * @param players An array of player types.
     * @returns A promise that resolves to a new deck of cards.
     * @throws An error if there is an issue generating the deck.
     */
    async getDeck(players: PlayerType[]): Promise<NewDeckType> {
        try {
            const cards = this.generateCardsString(players.length);
            const deck = await this.generatePartialDeck(cards);
            return deck;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Distributes cards to players from a specified deck.
     * 
     * @param deckId - The ID of the deck to draw cards from.
     * @param players - An array of player types.
     * @returns A promise that resolves when the cards are distributed successfully.
     * @throws An error if there is an issue with distributing the cards.
     */
    async distributeCards(deckId: string, players: PlayerType[]): Promise<void> {
        try {
            const drawnCards = await this.drawCardsFromDeck(deckId, (players.length + 1) * Number(process.env.CARDS_PER_PLAYER));
            const cards: CardType[] = drawnCards.cards.map((card) => CardSchema.parse(card));

            const initialHands = this.generateInitialHands(players, cards);

            const tablePile = await this.addCardsToPile(deckId, "table", cards.map((card) => card.code).join(","));

            const listedTablePile = await this.listCardsOfPile("table", deckId);

            const addedToPile: DeckWithPilesType[] = await this.addInitialHandsToPiles(deckId, players, initialHands.map((hand) => hand.cards.map((card) => card.code).join(",")));

            const listedPiles = await this.getListedPiles(deckId, players);

            


            // const initialHands = this.generateInitialHands(players, cards);
            // const initialHandsCodes = initialHands.map((hand) => hand.cards.map((card) => card.code).join(","));

            // const tablePile = await this.addCardsToPile(deckId, "table", cards.map((card) => card.code).join(","));

            // console.table(tablePile);

            // const addedToPile: DeckWithPilesType[] = await this.addInitialHandsToPiles(deckId, players, initialHandsCodes);

            // console.table(addedToPile.map((pile) => pile.piles));

            // const listedPiles = await this.getListedPiles(deckId, players);

            // console.table(
            //     [initialHandsCodes.join(" --- "),
            //     listedPiles.map((pile) => pile.map((card) => card.code).join(",")).join(" --- ")]
            // )

            // const assignedHands = this.assignPlayerHands(players, listedPiles);

        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Generates a string representation of the cards for a game with the specified number of players.
     * @param players The number of players in the game.
     * @returns A string representation of the cards.
     * @throws {Error} If the number of players is greater than 13 or lesser than 3.
     */
    private generateCardsString(players: number): string {
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


    /**
     * Generates a partial deck of cards using the specified card codes.
     * @param cards - The card codes to include in the partial deck. Ex: 10S,AC,2D
     * @returns A promise that resolves to a new deck of cards.
     */
    private async generatePartialDeck(cards: string): Promise<NewDeckType> {
        try {
            const response = await fetch(`${process.env.DECK_OF_CARDS_API}new/shuffle/?cards=${cards}&jokers_enabled=true`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Generates the initial hands for each player.
     * 
     * @param players - An array of player objects.
     * @param cards - An array of card objects.
     * @returns An array of objects containing the player ID and their initial hand of cards.
     */
    private generateInitialHands(players: PlayerType[], cards: CardType[]): { playerId: string, cards: CardType[] }[] {
        const initialHands: { playerId: string, cards: CardType[] }[] = [];
        const cardsPerPlayer = Number(process.env.CARDS_PER_PLAYER);

        // the first player gets the first cardsPerPlayer+1 cards, the second player gets the next cardsPerPlayer cards, and so on
        for (let i = 0; i < players.length; i++) {
            if (i === 0) {
                initialHands.push({ playerId: players[i].id, cards: cards.slice(i * (cardsPerPlayer + 1), (i + 1) * (cardsPerPlayer + 1)) });
            } else {
                initialHands.push({ playerId: players[i].id, cards: cards.slice(i * cardsPerPlayer + 1, (i + 1) * cardsPerPlayer + 1) });
            }
        }

        return initialHands;
    }

    /**
     * Retrieves the listed piles of cards for the specified deck and players.
     * @param deckId - The ID of the deck.
     * @param players - An array of player types.
     * @returns A promise that resolves to a 2D array of card types representing the listed piles.
     */
    private async getListedPiles(deckId: string, players: PlayerType[]): Promise<CardType[][]> {
        const listedPiles: CardType[][] = await Promise.all(players.map(async (player) => await this.listCardsOfPile(player.id, deckId)));
        return listedPiles;
    }

    /**
     * Assigns player hands based on the given listed piles.
     * 
     * @param players - An array of player objects.
     * @param listedPiles - An array of arrays representing the listed piles of cards.
     */
    private assignPlayerHands(players: PlayerType[], listedPiles: CardType[][]): void {
        const playerHands = listedPiles.map((cards, index) => {
            return { [players[index].id]: cards }
        });

        players.map((player, index) => {
            player.cards = playerHands[index][player.id];
        });
    }

    /**
     * Adds initial hands to the piles for each player in the game.
     * 
     * @param deckId - The ID of the deck.
     * @param players - An array of player objects.
     * @param initialHandsCodes - An array of initial hand codes for each player.
     * @returns A promise that resolves to an array of DeckWithPilesType objects representing the updated piles.
     */
    private async addInitialHandsToPiles(deckId: string, players: PlayerType[], initialHandsCodes: string[]): Promise<DeckWithPilesType[]> {
        const initialHandsDrawn = await Promise.all(players.map(async (player, index) => {
            return await this.drawCardsFromTablePile(deckId, Number(process.env.CARDS_PER_PLAYER));
        }));

        const addedToPile = await Promise.all(initialHandsDrawn.map(async (drawn, index) => {
            return await this.addCardsToPile(deckId, players[index].id, initialHandsCodes[index]);
        }));

        return addedToPile;
    }

    /**
     * Draws a specified number of cards from a deck.
     * @param deckId - The ID of the deck from which to draw the cards.
     * @param count - The number of cards to draw.
     * @returns A promise that resolves to the drawn cards.
     * @throws If an error occurs during the API request.
     */
    private async drawCardsFromDeck(deckId: string, count: number): Promise<DrawnCardType> {
        try {
            const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/draw/?count=${count}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    private async drawCardsFromTablePile(deckId: string, count: number): Promise<DrawnCardType> {
        try {
            const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/table/draw/?count=${count}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Adds cards to a specific pile in a deck.
     * 
     * @param deckId - The ID of the deck.
     * @param playerId - The ID of the player.
     * @param cards - The cards to be added to the pile.
     * @returns A promise that resolves to the updated deck with piles.
     * @throws If an error occurs during the API request.
     */
    private async addCardsToPile(deckId: string, playerId: string, cards: string): Promise<DeckWithPilesType> {
        try {
            const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/${playerId}/add/?cards=${cards}`);
            const data = await response.json();
            return data;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    /**
     * Retrieves the list of cards from a specific pile for a player.
     * 
     * @param playerId - The ID of the player.
     * @param deckId - The ID of the deck.
     * @returns A promise that resolves to an array of CardType objects representing the cards in the pile.
     * @throws If there is an error while fetching the data or parsing the response.
     */
    private async listCardsOfPile(playerId: string, deckId: string): Promise<CardType[]> {
        try {
            const response = await fetch(`${process.env.DECK_OF_CARDS_API}${deckId}/pile/${playerId}/list/`);
            const data = await response.json();
            return data.piles[playerId].cards.map((card: CardType) => CardSchema.parse(card));
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default new GameService();