import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: 'y8hfnifa', 
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-03-01',
});
