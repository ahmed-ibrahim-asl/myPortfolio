export interface PostFrontmatter {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  draft?: boolean;
  series?: string;
  part?: string;
  difficulty?: string;
}

export interface Post {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  draft: boolean;
  series?: string;
  part?: string;
  difficulty?: string;
  content: string;
  html: string;
}

export interface WritingSeries {
  title: string;
  slug: string;
  description: string;
  posts: Post[];
}
export interface PromptFrontmatter {
  title: string;
  summary: string;
  tags: string[];
  model: string;
  publishedAt: string;
  draft?: boolean;
}

export interface PromptItem {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  model: string;
  publishedAt: string;
  draft: boolean;
  content: string;
  html: string;
}

export interface LibraryItem {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
  draft: boolean;
  rights: string;
  attribution: string;
  pdfPath: string;
  content: string;
  html: string;
}
