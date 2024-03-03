import z from "zod";
import PlayerSchema from "./PlayerType";
import GameSchema from "./GameType";

const GameStateSchema = z.object({
    game: GameSchema,
    players: z.array(PlayerSchema),
    isPlaying: z.boolean(),
    table: z.object({
        success: z.boolean(),
        deck_id: z.string(),
        shuffled: z.boolean(),
        remaining: z.number(),
    }).optional()
});

export type GameStateType = z.infer<typeof GameStateSchema>;
export default GameStateSchema;
