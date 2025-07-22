import { z } from 'zod';

// single product object
export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  imageUrl: z.string().url(),
  category: z.string(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(),
  location: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// For an array of products
export const ProductsArraySchema = z.array(ProductSchema);

export type dbProductSchema = z.infer<typeof ProductsArraySchema>

type Promotion = {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    isActive: boolean;
  };

  export const transformPromotionObject = (inputObject: z.infer<typeof ProductSchema>): Promotion => {
    const result: Promotion = {
        id: inputObject.id.toString(), // Convert number to string
        title: inputObject.title,
        description: inputObject.description,
        price: inputObject.price,
        imageUrl: inputObject.imageUrl,
        category: inputObject.category,
        startDate: inputObject.startDate,
        endDate: inputObject.endDate,
        location: inputObject.location,
        isActive: inputObject.isActive
    };
    console.log("result")
    return result;
};