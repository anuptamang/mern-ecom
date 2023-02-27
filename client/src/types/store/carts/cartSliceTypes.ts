import { IProduct } from "../products/productSliceTypes";

export interface ICartSlice {
  items: IProduct[];
  totalCount: number;
  totalPrice: number;
}
