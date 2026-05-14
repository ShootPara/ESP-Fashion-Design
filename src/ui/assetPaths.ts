import type { ModuleActivity, ModuleWeekAsset, ModuleWeekBundle } from "../types";

export interface AssetReferenceState {
  assetId: string;
  assetType: string;
  title: string;
  displayTitle: string;
  runtimeUrl: string;
  canonicalPath: string;
  status: string;
}

function buildFallbackAssetLabel(assetId: string, assetType: string): string {
  const match = assetId.match(/(\d+)(?!.*\d)/u);
  const sequence = match ? String(Number.parseInt(match[1], 10)) : "";
  const prefix = assetType === "audio" ? "Audio" : "Image";
  return sequence ? `${prefix} ${sequence}` : `${prefix} asset`;
}

function resolveDisplayTitle(assetId: string, asset: ModuleWeekAsset | undefined): string {
  const candidate = asset?.title?.trim();
  if (candidate) {
    return candidate;
  }

  return buildFallbackAssetLabel(assetId, asset?.asset_type ?? "image");
}

function normalizeAssetPath(targetFilename: string | undefined): string {
  if (!targetFilename) {
    return "";
  }

  return targetFilename.replaceAll("\\", "/").replace(/^\/+/, "");
}

export function resolveCanonicalMediaUrl(targetFilename: string | undefined): string {
  const normalized = normalizeAssetPath(targetFilename);
  return normalized ? `/${normalized}` : "";
}

export function getWeekAssetMap(week: ModuleWeekBundle): Map<string, ModuleWeekAsset> {
  return new Map((week.asset_manifest?.assets ?? []).map((asset) => [asset.asset_id, asset]));
}

export function getActivityAssets(week: ModuleWeekBundle, activity: ModuleActivity): AssetReferenceState[] {
  const assetMap = getWeekAssetMap(week);

  return (activity.asset_refs ?? []).map((assetId) => {
    const asset = assetMap.get(assetId);

    return {
      assetId,
      assetType: asset?.asset_type ?? "unknown",
      title: asset?.title ?? "Missing asset metadata",
      displayTitle: resolveDisplayTitle(assetId, asset),
      runtimeUrl: resolveCanonicalMediaUrl(asset?.target_filename),
      canonicalPath: normalizeAssetPath(asset?.target_filename),
      status: asset?.status ?? "missing_metadata"
    };
  });
}

export function findAssetById(week: ModuleWeekBundle, assetId: string | undefined): AssetReferenceState | null {
  if (!assetId) {
    return null;
  }

  const asset = getWeekAssetMap(week).get(assetId);
  if (!asset) {
    return {
      assetId,
      assetType: "unknown",
      title: "Missing asset metadata",
      displayTitle: buildFallbackAssetLabel(assetId, "image"),
      runtimeUrl: "",
      canonicalPath: "",
      status: "missing_metadata"
    };
  }

  return {
    assetId,
    assetType: asset.asset_type,
    title: asset.title,
    displayTitle: resolveDisplayTitle(assetId, asset),
    runtimeUrl: resolveCanonicalMediaUrl(asset.target_filename),
    canonicalPath: normalizeAssetPath(asset.target_filename),
    status: asset.status
  };
}

export function summarizeWeekMedia(week: ModuleWeekBundle) {
  const assets = week.asset_manifest?.assets ?? [];
  const imageCount = assets.filter((asset) => asset.asset_type === "image").length;
  const audioCount = assets.filter((asset) => asset.asset_type === "audio").length;

  return {
    total: assets.length,
    imageCount,
    audioCount
  };
}
