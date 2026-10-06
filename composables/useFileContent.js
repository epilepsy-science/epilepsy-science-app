// composables/useFileContent.js
import { filePathOf, publicDownloadsBase, publicFileUrl } from "~/utils/publicDownloads";

export const useFileContent = () => {
  const runtimeConfig = useRuntimeConfig();

  /**
   * Fetches a published file's content through a download-service link
   * @param {Object} file - File object with path or uri
   * @param {Number} datasetId - Dataset ID
   * @param {Number} version - Dataset version
   * @returns {Promise<string>} File content as text
   */
  async function fetchFileContent(file, datasetId, version) {
    try {
      const token = (await useGetToken()) || "";
      const base = publicDownloadsBase({
        api2Host: runtimeConfig.public.api2_host,
        publicHost: runtimeConfig.public.download_public_host,
        token,
      });
      // A preview is a view, not a download.
      const { url } = await publicFileUrl({ base, token, datasetId, version, path: filePathOf(file), purpose: "view" });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Return as text
      return await response.text();
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw error;
    }
  }

  return {
    fetchFileContent,
  };
};
