/**
 * The signed-in visitor's Pennsieve token for download-service: with one,
 * downloads go through api2's /downloads/public as that user; without one,
 * anonymously through the public downloads API.
 *
 * Epilepsy.Science has no visitor sign-in yet. The Amplify session
 * (plugins/amplify.js) is a shared account, never a visitor's: downloads
 * made with its token would be that account's, and its archives emailed to
 * it. So there is no token, and every download is anonymous. When visitors
 * can sign in, return their access token here (api2 must then also allow
 * this site's origin).
 * @returns {Promise<String>}
 */
export default async function () {
  return ''
}
