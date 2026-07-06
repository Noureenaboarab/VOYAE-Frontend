import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { Address, BackendOrder, Order, UserProfile } from '../models';

function mapUser(data: any): UserProfile {
  return {
    id: data.id,
    name: data.name,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    email: data.email,
    dateOfBirth: data.dateOfBirth ?? '',
    gender: data.gender ?? '',
    job: data.job ?? '',
    memberSince: data.memberSince
      ? new Date(data.memberSince).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '',
  };
}
function mapOrder(data: BackendOrder | any): Order {
  const items = data.items ?? data.orderItems ?? [];
  const mappedItems = items.map((item: any) => {
    const product = item.product ?? item.productDto ?? item.productDTO ?? {};

    return {
      id: item.id,
      productId: String(product.id ?? item.productId ?? ''),
      name: product.name ?? item.productName ?? item.name ?? 'Product',
      type: product.categoryName ?? item.categoryName ?? '',
      imageUrl: product.imageUrl ?? item.imageUrl ?? '',
      quantity: Number(item.quantity ?? 0),
      price: Number(item.priceAtPurchase ?? item.price ?? item.unitPrice ?? product.basePrice ?? 0),
    };
  });
  const itemsTotal = mappedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return {
    id: String(data.id),
    date: data.createdAt ?? data.date ?? '',
    status: (data.status ?? '').toLowerCase() as Order['status'],
    paymentStatus: data.paymentStatus,
    total: Number(data.totalAmount ?? data.total ?? itemsTotal),
    items: mappedItems,
  };
}

function mapAddress(data: any): Address {
  return {
    id: Number(data.id),
    label: data.label ?? 'Address',
    street: data.street ?? '',
    city: data.city ?? '',
    country: data.country ?? '',
    postalCode: data.postalCode ?? '',
    isDefault: Boolean(data.isDefault),
  };
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http.get<any>('/api/account/profile').pipe(map(mapUser));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<BackendOrder[]>('/api/orders').pipe(
      map(orders => orders.map(mapOrder))
    );
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<any[]>('/api/address').pipe(
      map(addresses => addresses.map(mapAddress))
    );
  }

  setDefaultAddress(id: number): Observable<void> {
    return this.http.patch<void>(`/api/address/${id}`, {});
  }

  getOrder(id: string | number): Observable<Order> {
    return this.http.get<BackendOrder>(`/api/orders/${id}`).pipe(
      map(mapOrder),
      switchMap(order => {
        if (order.items.length > 0) {
          return of(order);
        }

        return this.getOrders().pipe(
          map(orders => orders.find(item => item.id === String(id)) ?? order)
        );
      })
    );
  }
}
