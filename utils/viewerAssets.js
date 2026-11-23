// Viewer assets of published packages (packages-service /discover/assets):
// derived representations a viewer reads instead of the source file, such as
// a Zarr bundle for a timeseries.

// Same literal as @pennsieve-viz/tsviewer's TIMESERIES_ZARR (a test keeps them
// equal); importing it would load the viewer bundle during SSR.
export const TIMESERIES_ZARR = "timeseries-zarr";

// Only ready assets, each URL once, each carrying the response's CloudFront policy.
export function readyAssets(response) {
  const cloudfront = response?.cloudfront || null;
  const seenAssetUrls = new Set();
  return (response?.assets || [])
    .filter((asset) => {
      if (asset.status !== "ready") return false;
      if (seenAssetUrls.has(asset.asset_url)) return false;
      seenAssetUrls.add(asset.asset_url);
      return true;
    })
    .map((asset) => ({ ...asset, cloudfront }));
}

// A Zarr bundle is read straight from CloudFront and needs no session, so it is
// the only timeseries asset an anonymous visitor can view.
export function pickZarrTimeseriesAsset(assets) {
  return assets.find((asset) => asset.asset_type === TIMESERIES_ZARR && asset.asset_url) || null;
}

// `asset_url` is a directory prefix, and one CloudFront policy covers everything
// under it, so the signature goes on the prefix and the reader appends its own
// keys. Returns the bare prefix when no policy came back.
export function signedAssetUrl(asset) {
  const assetUrl = asset?.asset_url;
  if (!assetUrl) return null;

  const cloudfront = asset.cloudfront;
  if (!cloudfront?.policy || !cloudfront?.signature || !cloudfront?.key_pair_id) return assetUrl;

  const signatureParams = new URLSearchParams({
    Policy: cloudfront.policy,
    Signature: cloudfront.signature,
    "Key-Pair-Id": cloudfront.key_pair_id,
  });
  return `${assetUrl}?${signatureParams.toString()}`;
}
