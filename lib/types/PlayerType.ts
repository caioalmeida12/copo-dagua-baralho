import { z } from 'zod';
import CardSchema from './CardType';

const PlayerSchema = z.object({
    id: z.preprocess(
        (val) => String(val),
        z.string().refine((val) => /^[0-9a-f]{32}$/i.test(val))
    ),
    name: z.preprocess(
        (val) => String(val),
        z.string().min(1).max(128).refine((val) => val != 'undefined')
    ),
    cards: z.array(CardSchema).default([]),
});

export default PlayerSchema;
export type PlayerType = z.infer<typeof PlayerSchema>;