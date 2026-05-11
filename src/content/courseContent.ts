import type { AssetBinding, CourseIndex, ModuleBundle } from "../types";

export async function getCourseIndex(assets: AssetBinding, origin: string): Promise<CourseIndex> {
  const request = new Request(new URL("/app-content/course-index.json", origin).toString());
  const response = await assets.fetch(request);

  if (!response.ok) {
    throw new Error(`Unable to load generated app content: ${response.status}`);
  }

  return (await response.json()) as CourseIndex;
}

export async function getModuleBundle(
  assets: AssetBinding,
  origin: string,
  moduleId: string
): Promise<ModuleBundle | null> {
  const request = new Request(new URL(`/app-content/modules/${moduleId}.json`, origin).toString());
  const response = await assets.fetch(request);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load generated module bundle: ${response.status}`);
  }

  return (await response.json()) as ModuleBundle;
}
