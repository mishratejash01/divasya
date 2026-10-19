/** Where overlays (loaders, sheets, story viewer) mount: inside the app's
 *  phone-width frame, so on a wide screen they cover the app — not the whole
 *  window. Falls back to the body before the frame exists. */
export function portalRoot(): HTMLElement {
  return (document.querySelector(".app-frame") as HTMLElement | null) ?? document.body;
}
