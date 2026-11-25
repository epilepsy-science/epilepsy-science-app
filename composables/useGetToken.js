/**
 * The signed-in visitor's Pennsieve token for download-service: with one,
 * downloads go through api2's /downloads/public as that user; without one,
 * anonymously through the public downloads API.
 *
 * Downloads stay anonymous for now, also for a visitor signed in for
 * notebooks (pages/sign-in.vue). To make them the visitor's, return their
 * access token here (utils/visitorAuth accessToken; api2 must then also
 * allow this site's origin).
 * @returns {Promise<String>}
 */
export default async function () {
  return ''
}
