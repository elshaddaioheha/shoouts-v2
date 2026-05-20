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
};
