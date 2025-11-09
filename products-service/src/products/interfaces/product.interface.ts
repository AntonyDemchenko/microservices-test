export interface Product {
  id: number;
  name: string;
  price: number;
  created_at: Date;
}

export interface ProductListResponse {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
