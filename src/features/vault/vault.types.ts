export type VaultProject = {
  id: string;
  sourcePath?: string;
  ownerId: string;
  title: string;
  artist: string;
  audioUrl: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  folderName?: string | null;
  lifecycleStatus?: string | null;
  genre?: string | null;
  bpm?: number | null;
  key?: string | null;
  description?: string | null;
};

export type VaultProjectEditFields = {
  title: string;
  artist: string;
  coverUrl: string | null;
  genre: string | null;
  bpm: number | null;
  key: string | null;
  description: string | null;
};
