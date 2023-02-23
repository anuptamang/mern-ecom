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
  status: IProductSliceStatus;
}

export interface IProductSliceStatus {
  loading: boolean;
  success: boolean;
  error: boolean;
}

export interface IProductSliceParams {
  category: string
}