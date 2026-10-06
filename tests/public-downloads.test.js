import { describe, it, expect, vi } from "vitest";
import {
  createPublicArchive,
  filePathOf,
  publicDownloadsBase,
  publicFileUrl,
  rememberArchive,
  rememberedArchives,
} from "~/utils/publicDownloads";
import { agentPublicCommand, awsCommands, createPublicSelection } from "~/utils/agentDownload";

function respond(status, body) {
  return vi.fn().mockResolvedValue({ status, ok: status < 400, json: () => Promise.resolve(body) });
}

describe("publicDownloadsBase", () => {
  it("uses the anonymous host beside api2 without a token", () => {
    expect(publicDownloadsBase({ api2Host: "https://api2.pennsieve.io", publicHost: "" })).toBe(
      "https://downloads.pennsieve.io/public"
    );
  });

  it("uses download_public_host when set", () => {
    expect(publicDownloadsBase({ api2Host: "https://api2.pennsieve.io", publicHost: "https://dl.example.org/" })).toBe(
      "https://dl.example.org/public"
    );
  });

  it("uses api2 with a token", () => {
    expect(publicDownloadsBase({ api2Host: "https://api2.pennsieve.io/", token: "t" })).toBe(
      "https://api2.pennsieve.io/downloads/public"
    );
  });
});

describe("download-service requests", () => {
  it("names Epilepsy.Science as the client and sends no token anonymously", async () => {
    const fetchFn = respond(200, { url: "https://s3/x" });
    const base = "https://downloads.pennsieve.io/public";
    await publicFileUrl({ base, token: "", datasetId: "12", version: "3", path: "a/b.txt", purpose: "view" }, fetchFn);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe(`${base}/files/url`);
    expect(init.headers["X-Pennsieve-Client"]).toBe("epilepsy-science");
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({ datasetId: 12, version: 3, paths: ["a/b.txt"], purpose: "view" });
  });

  it("sends the archive's paths and name", async () => {
    const fetchFn = respond(201, { id: "pa_x", status: "QUEUED" });
    await createPublicArchive(
      { base: "https://d/public", datasetId: 1, version: 2, paths: ["x", "y"], rootPath: "data", archiveName: "mine" },
      fetchFn
    );
    expect(JSON.parse(fetchFn.mock.calls[0][1].body)).toEqual({
      datasetId: 1,
      version: 2,
      paths: ["x", "y"],
      rootPath: "data",
      archiveName: "mine",
    });
  });

  it("raises download-service's message with its status", async () => {
    const fetchFn = respond(413, { message: "too large" });
    await expect(createPublicArchive({ base: "https://d/public", datasetId: 1 }, fetchFn)).rejects.toMatchObject({
      status: 413,
      message: "too large",
    });
  });

  it("saves selections as Epilepsy.Science", async () => {
    const fetchFn = respond(201, { id: "sel_1" });
    await createPublicSelection({ url: "https://d/public/selections", datasetId: 1, version: 2, paths: ["x"] }, fetchFn);
    expect(fetchFn.mock.calls[0][1].headers["X-Pennsieve-Client"]).toBe("epilepsy-science");
  });
});

describe("filePathOf", () => {
  it("prefers the path, else reads it from the S3 URI", () => {
    expect(filePathOf({ path: "files/a.edf" })).toBe("files/a.edf");
    expect(filePathOf({ uri: "s3://edots-prod-aod-discover-publish50-use1/657/files/a.edf" })).toBe("files/a.edf");
    expect(filePathOf({})).toBe("");
  });
});

describe("remembered archives", () => {
  it("keeps unexpired archives per dataset version", () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    const now = Date.parse("2026-10-06T12:00:00Z");
    rememberArchive({ id: "pa_a", datasetId: 1, version: 2, whole: true, expiresAt: "2026-10-07T00:00:00Z" }, storage, now);
    rememberArchive({ id: "pa_b", datasetId: 1, version: 2, expiresAt: "2026-10-06T00:00:00Z" }, storage, now);
    rememberArchive({ id: "pa_c", datasetId: 9, version: 1, expiresAt: "2026-10-07T00:00:00Z" }, storage, now);

    expect(rememberedArchives({ datasetId: "1", version: "2" }, storage, now).map((a) => a.id)).toEqual(["pa_a"]);
  });
});

describe("agent and AWS commands", () => {
  it("names the version and quotes paths", () => {
    expect(agentPublicCommand({ datasetId: 657, version: 2, paths: ["sub 1/a.edf"], folderName: "EEG: Study #1" })).toBe(
      "pennsieve download public 657 ./EEG-Study-1 --version 2 --path 'sub 1/a.edf'"
    );
  });

  it("reads AWS Open Data without signing, Pennsieve buckets as requester pays", () => {
    expect(awsCommands({ uri: "s3://edots-prod-aod-discover-publish50-use1/657/", folderName: "x" })).toEqual([
      "aws s3 sync s3://edots-prod-aod-discover-publish50-use1/657/ ./x --no-sign-request",
    ]);
    expect(
      awsCommands({ uri: "s3://pennsieve-prod-discover-publish50-use1/456/", items: [{ path: "a.edf" }], folderName: "x" })
    ).toEqual(["aws s3 cp s3://pennsieve-prod-discover-publish50-use1/456/a.edf ./x/a.edf --request-payer requester"]);
  });
});
