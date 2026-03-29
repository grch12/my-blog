import { createContentLoader } from "vitepress";
import { createPost, Post } from "../../../defines";

export declare const data: Post[];

export default createContentLoader("./posts/**/*.md", {
  excerpt: false,
  /**
   * Transforms the raw data into an array of posts with their titles, URLs, dates, descriptions, and tags.
   * It goes through each post, and for each post, it maps the frontmatter into a Post object.
   * It then filters out the posts which do not have titles or dates.
   * Finally, it sorts the posts by their dates in descending order.
   * @param raw The raw data from the markdown files.
   * @returns An array of Post objects, sorted by their dates in descending order.
   */
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter }): Post => createPost(url, frontmatter))
      .filter((p) => p.title && p.date)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  },
});
