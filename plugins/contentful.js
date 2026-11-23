import { createClient } from "contentful";
import { mockProjects } from "~/data/mockProjects.js";

const EMPTY_COLLECTION = { items: [], total: 0, skip: 0, limit: 0 };
const EMPTY_ENTRY = { fields: {}, sys: {} };

function wrapClientWithFallback(client) {
  return {
    async getEntry(id, query) {
      try {
        return await client.getEntry(id, query);
      } catch (error) {
        console.warn("Contentful getEntry failed, returning empty entry. Error:", error?.status ?? error?.message);
        return EMPTY_ENTRY;
      }
    },
    async getEntries(query) {
      try {
        return await client.getEntries(query);
      } catch (error) {
        console.warn("Contentful getEntries failed, returning empty collection. Error:", error?.status ?? error?.message);
        return EMPTY_COLLECTION;
      }
    },
  };
}

const mockClient = {
  async getEntry(id) {
    return mockProjects.find((p) => p.sys.id === id) || EMPTY_ENTRY;
  },
  async getEntries() {
    return { items: mockProjects, total: mockProjects.length, skip: 0, limit: 100 };
  },
};

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (!config.public.CTF_SPACE_ID) {
    console.warn("CTF_SPACE_ID not set, serving mock Contentful projects.");
    return { provide: { contentfulClient: mockClient } };
  }

  const isPreview = config.public.CTF_API_HOST === "preview.contentful.com";
  const accessToken = isPreview
    ? config.public.CTF_CPA_ACCESS_TOKEN
    : config.public.CTF_CDA_ACCESS_TOKEN;

  const client = createClient({
    space: config.public.CTF_SPACE_ID,
    accessToken,
    host: config.public.CTF_API_HOST,
    retryOnError: false,
  });

  return {
    provide: {
      contentfulClient: wrapClientWithFallback(client),
    },
  };
});