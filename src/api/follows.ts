import client from './client';

export async function followUser(username: string): Promise<void> {
  await client.post(`/users/${username}/follow`);
}

export async function unfollowUser(username: string): Promise<void> {
  await client.delete(`/users/${username}/follow`);
}
