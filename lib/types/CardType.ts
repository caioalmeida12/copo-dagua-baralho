import z from "zod";

const CardSchema = z.object({
    code: z.union([z.string().regex(/[0-9JQKA][SHCD]/), z.literal("X1"), z.literal("X2")]),
    image: z.string().url(),
    images: z.object({
        svg: z.string().url(),
        png: z.string().url(),
    }),
    value: z.string(),
    suit: z.enum(["HEARTS", "DIAMONDS", "CLUBS", "SPADES", "BLACK", "RED"]),
})

export type CardType = z.infer<typeof CardSchema>;
export default CardSchema;