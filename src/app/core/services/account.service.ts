import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserProfile, Order } from '../models';

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

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http.get<any>('/api/account/profile').pipe(map(mapUser));
  }

  // not added yet in the backend 
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('/api/account/orders');
  }
}
