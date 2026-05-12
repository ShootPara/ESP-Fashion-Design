import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const courseRoot = path.join(repoRoot, "content", "course");
const modulesRoot = path.join(courseRoot, "modules");
const outputRoot = path.join(repoRoot, "public", "app-content");
const modulesOutputRoot = path.join(outputRoot, "modules");

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

async function ensureExists(filePath) {
  try {
    await readFile(filePath);
  } catch {
    throw new Error(`Missing required canonical file: ${path.relative(repoRoot, filePath)}`);
  }
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function buildModuleBundle(moduleDirName) {
  const moduleRoot = path.join(modulesRoot, moduleDirName);
  const moduleManifestPath = path.join(moduleRoot, "module_manifest.json");
  const moduleManifest = await readJson(moduleManifestPath);
  const weeks = [];

  for (const weekEntry of moduleManifest.weeks) {
    const weekFolder = `week-${String(weekEntry.week_number).padStart(2, "0")}`;
    const weekRoot = path.join(moduleRoot, weekFolder);
    const weekManifestPath = path.join(weekRoot, "week_manifest.json");
    const activitiesPath = path.join(weekRoot, "activities.json");
    const vocabularyPath = path.join(weekRoot, "vocabulary.json");
    const assetManifestPath = path.join(weekRoot, "asset_manifest.json");
    const imagePromptsPath = path.join(weekRoot, "image_prompts.json");
    const audioPromptsPath = path.join(weekRoot, "audio_prompts.json");
    const lessonPlanPath = path.join(weekRoot, "lesson_plan.md");
    const teacherNotesPath = path.join(weekRoot, "teacher_notes.md");

    await Promise.all([
      ensureExists(weekManifestPath),
      ensureExists(activitiesPath),
      ensureExists(vocabularyPath),
      ensureExists(assetManifestPath),
      ensureExists(imagePromptsPath),
      ensureExists(audioPromptsPath),
      ensureExists(lessonPlanPath),
      ensureExists(teacherNotesPath)
    ]);

    const weekManifest = await readJson(weekManifestPath);
    const activities = await readJson(activitiesPath);
    const vocabulary = await readJson(vocabularyPath);
    const assetManifest = await readJson(assetManifestPath);
    const imagePrompts = await readJson(imagePromptsPath);
    const audioPrompts = await readJson(audioPromptsPath);
    const lessonPlanMarkdown = await readText(lessonPlanPath);
    const teacherNotesMarkdown = await readText(teacherNotesPath);

    if (weekManifest.week_id !== weekEntry.week_id) {
      throw new Error(`Week manifest mismatch for ${weekFolder}: expected ${weekEntry.week_id}, got ${weekManifest.week_id}`);
    }

    weeks.push({
      week_id: weekManifest.week_id,
      week_number: weekEntry.week_number,
      title: weekManifest.title,
      summary: weekManifest.summary,
      essential_question: weekManifest.essential_question,
      week_manifest: weekManifest,
      activities,
      vocabulary,
      asset_manifest: assetManifest,
      image_prompts: imagePrompts,
      audio_prompts: audioPrompts,
      lesson_plan_markdown: lessonPlanMarkdown,
      teacher_notes_markdown: teacherNotesMarkdown,
      source_paths: {
        week_root: relative(weekRoot),
        week_manifest: relative(weekManifestPath),
        activities: relative(activitiesPath),
        vocabulary: relative(vocabularyPath),
        asset_manifest: relative(assetManifestPath),
        image_prompts: relative(imagePromptsPath),
        audio_prompts: relative(audioPromptsPath),
        lesson_plan: relative(lessonPlanPath),
        teacher_notes: relative(teacherNotesPath)
      }
    });
  }

  return {
    generated_at: new Date().toISOString(),
    module_id: moduleManifest.module_id,
    module_number: moduleManifest.module_number,
    title: moduleManifest.title,
    description: moduleManifest.description,
    module_manifest: moduleManifest,
    weeks,
    source_paths: {
      module_root: relative(moduleRoot),
      module_manifest: relative(moduleManifestPath)
    }
  };
}

async function main() {
  const courseManifest = await readJson(path.join(courseRoot, "course_manifest.json"));

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(modulesOutputRoot, { recursive: true });

  const availableModules = [];
  const moduleCatalog = [];

  for (const moduleEntry of courseManifest.modules) {
    const moduleManifestPath = path.join(modulesRoot, moduleEntry.module_id, "module_manifest.json");
    if (!(await exists(moduleManifestPath))) {
      moduleCatalog.push({
        module_id: moduleEntry.module_id,
        module_number: moduleEntry.module_number,
        title: moduleEntry.title,
        description: "",
        source_status: moduleEntry.status,
        planned_weeks: moduleEntry.planned_weeks,
        is_generated: false,
        available_weeks: [],
        bundle_path: null
      });
      continue;
    }

    const bundle = await buildModuleBundle(moduleEntry.module_id);
    const fileName = `${bundle.module_id}.json`;
    const filePath = path.join(modulesOutputRoot, fileName);
    const bundlePath = `/app-content/modules/${fileName}`;

    await writeFile(filePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");

    const moduleSummary = {
      module_id: bundle.module_id,
      module_number: bundle.module_number,
      title: bundle.title,
      description: bundle.description,
      source_status: moduleEntry.status,
      planned_weeks: moduleEntry.planned_weeks,
      is_generated: true,
      available_weeks: bundle.weeks.map((week) => ({
        week_id: week.week_id,
        week_number: week.week_number,
        title: week.title
      })),
      bundle_path: bundlePath
    };

    moduleCatalog.push(moduleSummary);
    availableModules.push(moduleSummary);
  }

  const courseIndex = {
    generated_at: new Date().toISOString(),
    course_id: courseManifest.course_id,
    title: courseManifest.title,
    subtitle: courseManifest.subtitle,
    description: courseManifest.description,
    total_modules: courseManifest.total_modules,
    total_weeks: courseManifest.total_weeks,
    modules: moduleCatalog,
    available_modules: availableModules
  };

  await writeFile(path.join(outputRoot, "course-index.json"), `${JSON.stringify(courseIndex, null, 2)}\n`, "utf8");
  console.log(`Generated app content for ${availableModules.length} module(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
