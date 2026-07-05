import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private http = inject(HttpClient);

  tick(): Observable<any> {
    return this.http.post('/api/engine/tick', {});
  }
}
