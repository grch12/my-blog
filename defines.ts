export interface Tag {
  name: string;
  count: number;
}

export interface Post {
  title: string;
  url: string;
  date: string;
  description?: string;
  tags?: string[];
}

export interface TagMap {
  [key: string]: Post[];
}

export function createPost(
  url: string,
  frontmatter: Record<string, any>,
): Post {
  return {
    title: frontmatter.title,
    url,
    date: (frontmatter.date as Date).toLocaleString("zh-CN", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }),
    description: frontmatter.description,
    tags: frontmatter.tags,
  };
}
