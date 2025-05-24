import PocketBase from 'pocketbase';

// Initialize PocketBase instance
const pb = new PocketBase(process.env.BASE_URL); // Replace with your PocketBase URL
pb.autoCancellation(false);

export default pb;

export async function renewTokenAuth(collectionName: string): Promise<void> {
  try {
    await pb.collection(collectionName).authRefresh();
    console.log('=> Token refreshed:', pb.authStore.token);
  } catch (error) {
    console.error('=> Failed to refresh auth token:', error);
    pb.authStore.clear(); // Optional: Clear auth if refresh fails
  }
}

export async function secureFetch<T>(
  collection: string,
  action: () => Promise<T>,
): Promise<T> {
  try {
    if (pb.authStore.isValid) {
      await renewTokenAuth(collection);
    }
    return await action();
  } catch (error: any) {
    const message = error?.message || '';
    const isTokenExpired =
      message.includes('token expired') || message.includes('Token expired');

    if (isTokenExpired) {
      console.warn('=> Token expired, attempting to refresh and retry...');
      await renewTokenAuth(collection);
      return await action();
    }

    throw error;
  }
}

// Generic function to fetch a single document from the collection
export const fetchPb = async <T extends Record<string, any>>(
  collection: string,
  id: string,
): Promise<T> => {
  return await secureFetch(collection, async () => {
    return await pb.collection(collection).getOne<T>(id);
  });
};

// Generic function to fetch all documents from the collection
export async function fetchAllPb<T extends Record<string, any>>(
  collectionName: string,
): Promise<T[]> {
  return await secureFetch(collectionName, async () => {
    const records = await pb.collection(collectionName).getFullList();
    return records.map((record) => record as unknown as T);
  });
}

// Generic function to create a document in the collection
export async function createPb<T extends Record<string, any>>(
  collectionName: string,
  data: T,
): Promise<string> {
  return await secureFetch(collectionName, async () => {
    const record = await pb.collection(collectionName).create(data);
    return record.id;
  });
}

// Generic function to update a document in the collection
export async function updatePb<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await secureFetch(collectionName, async () => {
    await pb.collection(collectionName).update(id, data);
  });
}

// Generic function to delete a document from the collection
export async function deletePb(
  collectionName: string,
  id: string,
): Promise<void> {
  await secureFetch(collectionName, async () => {
    await pb.collection(collectionName).delete(id);
  });
}
