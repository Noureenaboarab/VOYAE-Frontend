import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Blocks direct access to /admin/** for anyone who isn't an authenticated
// admin — logged-out visitors and logged-in non-admins alike get bounced
// straight to home, with no hint that an admin area exists.
export const adminGuard: CanActivateFn = (_route, _state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isAuthenticated() && auth.isAdmin()) {
        return true;
    }

    return router.createUrlTree(['/']);
};