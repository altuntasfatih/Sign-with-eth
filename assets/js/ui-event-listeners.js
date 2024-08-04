// Event listeners intended to be used on CasinoPortalFlaskWeb.UI

window.addEventListener("phx:scroll-to-top", (event) => {
  const element = event.target;
  if (element.hasAttribute("data-scroll-top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
window.addEventListener("phx:gtm-event", (e) =>
  window.dataLayer.push(e.detail.gtm_event),
);
