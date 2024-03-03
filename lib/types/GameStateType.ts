import z from "zod";
import PlayerSchema from "./PlayerType";
import GameSchema from "./GameType";

const GameStateSchema = z.object({
    game: GameSchema,
    players: z.array(PlayerSchema),
    isPlaying: z.boolean(),
});

export type GameStateType = z.infer<typeof GameStateSchema>;
export default GameStateSchema;
