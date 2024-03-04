import { z } from 'zod';

const PlayerSchema = z.object({
    id: z.preprocess(
        (val) => String(val),
        z.string().refine((val) => /^[0-9a-f]{32}$/i.test(val))
    ),
    name: z.preprocess(
        (val) => String(val),
        z.string().min(1).max(128).refine((val) => val != 'undefined')
    ),
});

export default PlayerSchema;
export type PlayerType = z.infer<typeof PlayerSchema>;