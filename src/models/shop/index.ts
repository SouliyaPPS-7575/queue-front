export interface NavbarProps {
  currentPage?: number;
  goToPage?: (page: number) => void;
}

export interface ProductsRes {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  items: ProductItem[];
}

export interface ProductItem {
  collectionId: string;
  collectionName: string;
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string[];
  created: string;
  updated: string;
}

export interface ProductRankingItem {
  collectionId: string;
  collectionName: string;
  created: string;
  id: string;
  product_id: string;
  rank: number;
  updated: string;
}

export interface CategoriesItem {
  collectionId: string;
  collectionName: string;
  created: string;
  id: string;
  name: string;
  name_la: string;
  updated: string;
  image_url: string;
}

export interface RelateProductsItem {
  collectionId: string;
  collectionName: string;
  id: string;
  product_id: string;
  relate_product_id: string[];
  created: string;
  updated: string;
}

export type Currencies = CurrencyItem[];

export interface CurrencyItem {
  collectionId: string;
  collectionName: string;
  id: string;
  ccy: string;
  type: string;
  rate: number;
  created: string;
  updated: string;
}

export interface CreateAddCart {
  customer_id?: string;
  product_id: string;
  quantity: number;
  status: string;
}

export interface CreateAddCartRes {
  collectionId: string;
  collectionName: string;
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  status: string;
  created: string;
  updated: string;
}

export type CartItems = CartItem[];

export interface CartItem {
  collectionId: string;
  collectionName: string;
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  status: string;
  created: string;
  updated: string;
}

export interface EditCartItem {
  customer_id: string;
  product_id: string;
  quantity: number;
  status: string;
}

export interface EnrichedCartItems {
  collectionId: string;
  collectionName: string;
  created: string;
  customer_id: string;
  id: string;
  product_id: string;
  quantity: number;
  status: string;
  updated: string;
  name: string;
  price: number;
  image_url: string;
}
