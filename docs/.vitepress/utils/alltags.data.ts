import { createContentLoader } from "vitepress";
import { Tag } from "../../../defines";

export declare const data: Tag[];

export default createContentLoader("./posts/**/*.md", {
  excerpt: false,
  /**
   * Transforms the raw data into an array of tags with their counts.
   * It goes through each post, and for each tag, it checks if the tag is already in the tags object.
   * If it is, it increments the count. If it is not, it adds the tag to the object with a count of 1.
   * Finally, it maps the entries of the tags object into an array of Tag objects and sorts them by their count in descending order.
   * @returns An array of Tag objects, sorted by their count in descending order.
   */
  transform(raw): Tag[] {
    let tags: { [key: string]: number } = {};

    raw.forEach(({ frontmatter }) => {
      frontmatter.tags.forEach((tag: string) => {
        if (!tags[tag]) {
          tags[tag] = 1;
        } else {
          tags[tag]++;
        }
      });
    });

    return Object.entries(tags)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count); // sort
  },
});
