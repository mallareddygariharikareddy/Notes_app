export type SortMode = 'updated' | 'created';

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  deletedAt?: number;
};
