// The Pennsieve URLs notebooks use, from the runtime config: the APIs a
// visitor's notebooks run through (dev's or production's), and Discover,
// whose production search finds the portal's datasets.
export function notebookEndpoints(config) {
  const api2Url = config.api2_host
  return {
    apiUrl: config.pennsieve_api_host,
    api2Url,
    discoverUrl: config.discover_api_host,
    viewsServiceUrl: `${api2Url}/views`,
    environmentsServiceUrl: `${api2Url}/environments`,
    pennsieveAppUrl: config.workspace_app_host,
  }
}
