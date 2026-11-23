// composables/useViewerAssets.js
import { readyAssets, signedAssetUrl } from "~/utils/viewerAssets";

export const useViewerAssets = () => {
  const runtimeConfig = useRuntimeConfig();

  async function fetchViewerAssets(packageId) {
    if (!packageId) return [];
    const url = `${runtimeConfig.public.packages_api_host}/discover/assets?package_id=${encodeURIComponent(packageId)}`;
    try {
      return readyAssets(await useSendXhr(url, { method: "GET" }));
    } catch {
      // A package without viewer assets answers 404.
      return [];
    }
  }

  // There is no route for one asset by id, but re-listing the package's assets
  // returns a fresh CloudFront signature.
  async function fetchSignedAssetUrl(packageId, assetId) {
    const assets = await fetchViewerAssets(packageId);
    const assetUrl = signedAssetUrl(assets.find((asset) => asset.id === assetId));
    if (!assetUrl) {
      throw new Error(`Could not re-sign viewer asset ${assetId}`);
    }
    return assetUrl;
  }

  return { fetchViewerAssets, fetchSignedAssetUrl };
};
