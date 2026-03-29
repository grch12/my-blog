import { createContentLoader } from "vitepress";
import { createPost, TagMap } from "../../../defines";

export declare const data: TagMap;

export default createContentLoader("./posts/**/*.md", {
  excerpt: false,
  /**
   * Transforms the raw data into a TagMap object.
   * It goes through each post, and for each post, it maps the frontmatter into a Post object.
   * It then filters out the posts which do not have titles or dates.
   * Finally, it sorts the posts by their dates in descending order.
   * @param raw The raw data from the markdown files.
   * @returns A TagMap object, where each key is a tag and each value is an array of Post objects.
   */
  transform(raw) {
    let tags: TagMap = {};
    raw.forEach(({ url, frontmatter }) => {
      frontmatter.tags.forEach((tag: string) => {
        if (!tags[tag]) {
          tags[tag] = [createPost(url, frontmatter)];
        } else {
          tags[tag].push(createPost(url, frontmatter));
        }
      });
    });
    return tags;
  },
});
