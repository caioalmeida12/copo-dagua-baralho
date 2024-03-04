import z from "zod";
import PlayerSchema from "./PlayerType";
import CardSchema from "./CardType";
import GameSchema from "./GameType";

const BaseDeckSchema = z.object({
    success: z.boolean(),
    deck_id: z.string(),
    shuffled: z.boolean().optional(),
    remaining: z.number(),
});

const NewDeckSchema = BaseDeckSchema;

const DrawnCardSchema = BaseDeckSchema.extend({
    cards: z.array(CardSchema),
});

const DeckWithPilesSchema = BaseDeckSchema.extend({
    piles: z.object({
        [`${z.string()}`]: z.object({
            remaining: z.number(),
            cards: z.array(CardSchema),
        }),
    }),
});

const DeckWithPilesAndDrawnCardsSchema = DeckWithPilesSchema.extend({
    drawnCards: z.array(CardSchema),
});

const GameStateSchema = z.object({
    game: GameSchema,
    players: z.array(PlayerSchema),
    isPlaying: z.boolean(),
    table: BaseDeckSchema.extend({
        cards: z.array(CardSchema).optional(),
        piles: z.object({
            [`${z.string()}`]: z.object({
                remaining: z.number(),
                cards: z.array(CardSchema),
            }),
        }),
    }).optional()
});

export type NewDeckType = z.infer<typeof NewDeckSchema>;
export type DrawnCardType = z.infer<typeof DrawnCardSchema>;
export type DeckWithPilesType = z.infer<typeof DeckWithPilesSchema>;
export type DeckWithPilesAndDrawnCardsType = z.infer<typeof DeckWithPilesAndDrawnCardsSchema>;
export type GameStateType = z.infer<typeof GameStateSchema>;

export {
    GameStateSchema,
    NewDeckSchema,
    DrawnCardSchema,
    DeckWithPilesSchema,
    DeckWithPilesAndDrawnCardsSchema
}
