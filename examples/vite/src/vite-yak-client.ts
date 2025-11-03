if (import.meta.hot) {
  import.meta.hot.on("yak:remove-css", (data: { ids: string[] }) => {
    console.log("[yak] Removing old CSS:", data.ids);

    // Remove all style tags for the old virtual CSS modules
    data.ids.forEach((id) => {
      const selector = `style[data-vite-dev-id="${id}"]`;
      document.querySelectorAll(selector).forEach((el) => {
        console.log("[yak] Removing style tag:", selector);
        el.remove();
      });
    });
  });
}
