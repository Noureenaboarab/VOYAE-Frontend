/** Matches whatever CartItem shape your existing CartService uses.
 *  Update fields to match your actual model. */
export interface CartItem {
  product_id: string;   // or `id` — match your existing model
  name: string;
  price: number;        // unit price in major currency units (e.g. 49.99)
  quantity: number;
  variant?: string;     // e.g. "Black / Large"
  image_url?: string;
}
