import { IStatus } from "types/status/statusTypes";

export interface IProduct {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export interface IProductSlice {
  productList: {
    data: IProduct[];
    currentPage: number | null;
    numberOfPages: number
  };
  status: IStatus;
}



export interface IProductSliceParams {
  category: string
}