import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AiSearchRequest, AiSearchResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AiSearchService {
    private readonly apiUrl = 'http://localhost:8080/api/ai/search';

    constructor(private http: HttpClient) {}

    search(query: string): Observable<AiSearchResponse> {
        const body: AiSearchRequest = { query };
        return this.http.post<AiSearchResponse>(this.apiUrl, body);
    }
}
