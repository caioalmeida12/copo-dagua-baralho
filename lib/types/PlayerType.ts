import { z } from 'zod';

const PlayerSchema = z.object({
    id: z.preprocess(
        (val) => String(val),
        z.string().uuid()
    ),
    name: z.preprocess(
        (val) => String(val),
        z.string().min(1).max(128).refine((val) => val != 'undefined')
    ),
});

export default PlayerSchema;
export type PlayerType = z.infer<typeof PlayerSchema>;