// A page that fills the window under the header (an open notebook) sets this
// while it does; the default layout then leaves out the site's footer.
export function useFullScreen() {
  return useState('full-screen', () => false)
}
