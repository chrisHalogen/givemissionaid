// Copy buttons stay hidden unless the clipboard works.
const status = document.getElementById("status");
if (navigator.clipboard) {
  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.hidden = false;
    b.addEventListener("click", async () => {
      const value = b.previousElementSibling;
      try {
        await navigator.clipboard.writeText(value.textContent.trim());
        b.textContent = "Copied";
        status.textContent = b.dataset.copy + " copied";
      } catch {
        b.textContent = "Failed";
        status.textContent = "Could not copy. Please select the text instead.";
      }
      setTimeout(() => (b.textContent = "Copy"), 2000);
    });
  });
}

// #menu, #privacy and #disclaimer open as dialogs; without JavaScript, CSS :target shows them.
const dialogs = [...document.querySelectorAll("dialog")];
const clearHash = () => history.replaceState(null, "", location.pathname + location.search);
function sync() {
  const want = dialogs.find((d) => "#" + d.id === location.hash);
  dialogs.forEach((d) => d !== want && d.open && d.close());
  if (want && !want.open) {
    want.showModal();
    want.scrollTop = 0;
  }
}
dialogs.forEach((d) => {
  d.addEventListener("close", () => location.hash === "#" + d.id && clearHash());
  d.addEventListener("click", (e) => {
    if (e.target === d) d.close();
    if (e.target.closest(".close")) {
      e.preventDefault();
      d.close();
    }
  });
});
// Open through pushState, so the page behind does not jump.
dialogs.forEach((d) =>
  document.querySelectorAll(`a[href="#${d.id}"]`).forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState(null, "", "#" + d.id);
      sync();
    }),
  ),
);
addEventListener("hashchange", sync);
addEventListener("popstate", sync);
sync();
