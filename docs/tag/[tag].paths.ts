import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.resolve(__dirname, "../posts");

function getAllTags(): string[] {
  const tagSet = new Set<string>();

  // 递归读取所有 Markdown 文件
  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;

    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf-8");
        const { data: frontmatter } = matter(content);
        const tags: string[] = frontmatter.tags ?? [];
        tags.forEach((tag) => tagSet.add(tag));
      }
    }
  }

  scanDir(POSTS_DIR);
  return [...tagSet];
}

export default {
  paths() {
    const tags = getAllTags();
    return tags.map((tag) => ({
      params: { tag },
    }));
  },
};
