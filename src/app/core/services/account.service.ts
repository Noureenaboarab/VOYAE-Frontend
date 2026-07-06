import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap } from 'rxjs';
import { BackendOrder, Order, UserProfile } from '../models';

function mapUser(data: any): UserProfile {
  const nameParts = (data.name ?? '').split(' ');
  return {
    id:          data.id,
    name:        data.name,
    firstName:   nameParts[0] ?? data.firstName ?? '',
    lastName:    nameParts.slice(1).join(' ') ?? data.lastName ?? '',
    email:       data.email,
    phone:       data.phone ?? '',
    dateOfBirth: data.birthday ?? data.dateOfBirth ?? '',
    job:         data.job,
    gender:      data.gender,
    street:      data.street,
    city:        data.city,
    country:     data.country ?? '',
    postalCode:  data.postalCode,
    memberSince: data.memberSince ?? data.createdAt ?? '',
    avatarUrl:   data.avatarUrl,
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
