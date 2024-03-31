import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter } from 'rxjs';

import { Product } from './models/product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly BASE_URL = 'https://dummyjson.com/products';

  private http: HttpClient = inject(HttpClient);

  constructor() {}

  fetchProducts(
    filters: FetchProductsFilters
  ): Observable<FetchProductsResponse> {
    let url = this.BASE_URL;
    let params = new HttpParams();

    if (filters.productTitle) {
      url = url.concat('/search');
      params = params.set('q', filters.productTitle);
    }

    params = params.set('limit', filters.limit).set('skip', filters.skip);

    return this.http.get<FetchProductsResponse>(url, { params });
  }
}

interface FetchProductsResponse {
  products: Product[];
}

interface FetchProductsFilters {
  limit: number;
  skip: number;
  productTitle: string | null;
}
