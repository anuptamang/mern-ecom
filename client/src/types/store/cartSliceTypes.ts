import { IProduct } from "./productSliceTypes";

export interface ICartSlice {
  items: IProduct[];
  totalCount: number;
  totalPrice: number;
}
