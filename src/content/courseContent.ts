import type { AssetBinding, CourseIndex } from "../types";

export async function getCourseIndex(assets: AssetBinding, origin: string): Promise<CourseIndex> {
  const request = new Request(new URL("/app-content/course-index.json", origin).toString());
  const response = await assets.fetch(request);

  if (!response.ok) {
    throw new Error(`Unable to load generated app content: ${response.status}`);
  }

  return (await response.json()) as CourseIndex;
}
