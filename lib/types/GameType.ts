import { z } from "zod"

const GameSchema = z.object({
    id: z.preprocess(
        (val) => String(val),
        z.string().min(6).max(6)
    ),
})

export type Game = z.infer<typeof GameSchema>
export default GameSchema
