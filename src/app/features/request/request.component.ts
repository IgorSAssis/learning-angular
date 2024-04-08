import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
} from 'rxjs';

import { NgxMaskDirective } from 'ngx-mask';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { SelectComponent } from '../../shared/components/select/select.component';

import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../services/product/models/product';

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzInputModule,
    NzInputNumberModule,
    NzFormModule,
    NzButtonModule,
    NzSelectModule,
    NzTableModule,
    NgxMaskDirective,
    SelectComponent,
  ],
  templateUrl: './request.component.html',
  styleUrl: './request.component.css',
})
export class RequestComponent {
  private productService: ProductService = inject(ProductService);
  private notificationService: NzNotificationService = inject(
    NzNotificationService
  );

  public collaboratorFormGroup!: FormGroup<CollaboratorFormGroup>;

  public selectedProduct: Product | null;
  public selectedProducts: Product[];
  public products: Product[];
  public isLoadingProducts: boolean;

  private searchChange$: BehaviorSubject<string>;
  private productFilters: ProductFilters;

  constructor() {
    this.createCollaboratorFormGroup();

    this.selectedProducts = [];
    this.selectedProduct = null;
    this.products = [];
    this.isLoadingProducts = false;
    this.searchChange$ = new BehaviorSubject('');
    this.productFilters = {
      title: null,
      skip: 0,
      limit: 10,
      haveMoreToFetch: true,
    };

    this.handleSearchChange();
  }

  addProductToTable() {
    if (this.selectedProduct) {
      this.selectedProducts = [...this.selectedProducts, this.selectedProduct];
      this.selectedProduct = null;

      if (this.isFilteringByTitle()) {
        this.cleanFilters();
        this.fetchProducts();
      }
    }
  }

  removeItemFromTable(index: number) {
    const selectedProductsCopy = [...this.selectedProducts];

    selectedProductsCopy.splice(index, 1);
    this.selectedProducts = [...selectedProductsCopy];
  }

  submitCollaboratorForm() {
    if (this.collaboratorFormGroup.invalid) {
      Object.keys(this.collaboratorFormGroup.controls).forEach((key) => {
        const control =
          this.collaboratorFormGroup.controls[key as CollaboratorFormGroupType];

        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });

      this.notificationService.warning(
        'Atenção',
        'Preencha os campos obrigatórios para conseguir salvar o formulário'
      );
      console.log(this.collaboratorFormGroup.controls);
      return;
    }

    this.notificationService.success(
      'Sucesso',
      'O formulário foi salvo com sucesso!'
    );
  }

  onSearch(value: string) {
    this.searchChange$.next(value);
  }

  onScrollToBottom() {
    if (this.productFilters.haveMoreToFetch) {
      this.isLoadingProducts = true;
      this.fetchProducts();
    }
  }

  onSelectedProductChange(product: Product | null) {
    if (product === null && this.isFilteringByTitle()) {
      this.cleanFilters();
      this.isLoadingProducts = true;
      this.products = [];
      this.fetchProducts();
    }
  }

  print() {
    console.log(this.selectedProduct);
  }

  private createCollaboratorFormGroup() {
    this.collaboratorFormGroup = new FormGroup<CollaboratorFormGroup>({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      age: new FormControl(null, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
      cpf: new FormControl(null, [Validators.required]),
    });
  }

  private fetchProducts() {
    console.log('Fetching products');
    this.productService
      .fetchProducts({
        productTitle: this.productFilters.title,
        skip: this.productFilters.skip,
        limit: this.productFilters.limit,
      })
      .subscribe({
        next: (response) => {
          console.log(response.products);

          if (response.products.length < this.productFilters.limit) {
            this.productFilters.haveMoreToFetch = false;
          }

          if (this.isFilteringByTitle()) {
            if (this.productFilters.skip === 0) {
              this.products = response.products;
            } else {
              this.products = this.products.concat(response.products);
            }
          } else {
            if (this.productFilters.skip === 0) {
              this.products = response.products;
            } else {
              this.products = this.products.concat(response.products);
            }
          }

          this.productFilters.skip += this.productFilters.limit;
          this.isLoadingProducts = false;
        },
        error(error) {
          console.error(error);
        },
      });
  }

  private cleanFilters() {
    this.productFilters = {
      haveMoreToFetch: true,
      limit: 10,
      skip: 0,
      title: null,
    };
  }

  private handleSearchChange() {
    this.searchChange$
      .asObservable()
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((value) => value.trim().length === 0 || value.trim().length >= 2)
      )
      .subscribe({
        next: (value) => {
          if (this.selectedProduct !== null) {
            return;
          }

          this.isLoadingProducts = true;
          this.cleanFilters();
          this.productFilters.title = value === '' ? null : value;
          this.fetchProducts();
        },
      });
  }

  private isFilteringByTitle() {
    return this.productFilters.title !== null;
  }
}

interface CollaboratorFormGroup {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  age: FormControl<string | null>;
  cpf: FormControl<string | null>;
}

interface ProductFormGroup {
  id: FormControl<number | null>;
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  price: FormControl<number | null>;
  discountPercentage: FormControl<number | null>;
  rating: FormControl<number | null>;
  stock: FormControl<number | null>;
  brand: FormControl<string | null>;
  category: FormControl<string | null>;
}

interface ProductFilters {
  title: string | null;
  skip: number;
  limit: number;
  haveMoreToFetch: boolean;
}

type CollaboratorFormGroupType = keyof CollaboratorFormGroup;
