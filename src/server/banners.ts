import { createServerFn } from '@tanstack/react-start';
import { BannerItem } from '~/models/banners';
import { fetchAllPb } from '~/services/pocketbaseService';
import { handleError } from './errorHandler';

export const getBanners = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    return await fetchAllPb<BannerItem>('banner');
  } catch (error) {
    throw handleError(error);
  }
});

