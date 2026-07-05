import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, map } from 'rxjs';
import { AccountService } from '../services/account.service';
import { UserProfile } from '../models';

export interface AccountResolvedData {
  profile: UserProfile | null;
}

export const accountResolver: ResolveFn<AccountResolvedData> = () => {
  const account = inject(AccountService);

  return account.getProfile().pipe(
    map(profile => ({ profile })),
    catchError(() => of({ profile: null })),
  );
};
