import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { OfferService } from '../services/offer.service';
import { Offer } from '../models';

export const offersResolver: ResolveFn<Offer[]> = () => {
  const service = inject(OfferService);
  return service.load();
};
