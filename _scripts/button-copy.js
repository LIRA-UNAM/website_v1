/*
  copies the value of a button-copy.html instance to the clipboard when its
  copy action is clicked. delegated from the document, so it works for any
  number of instances on a page.
*/

{
  const resetDelay = 2000;

  const showCopied = (wrapper, action) => {
    const icon = action.querySelector(".icon");
    const label = action.querySelector(".button-copy-label");

    wrapper.dataset.copied = "";
    icon?.classList.replace("fa-regular", "fa-solid");
    icon?.classList.replace("fa-copy", "fa-check");
    if (label) label.textContent = "Copied";

    clearTimeout(wrapper._copyTimer);
    wrapper._copyTimer = setTimeout(() => {
      delete wrapper.dataset.copied;
      icon?.classList.replace("fa-solid", "fa-regular");
      icon?.classList.replace("fa-check", "fa-copy");
      if (label) label.textContent = "Copy";
    }, resetDelay);
  };

  document.addEventListener("click", async (event) => {
    const action = event.target.closest(".button-copy-action");
    if (!action) return;

    const wrapper = action.closest(".button-copy");
    const input = wrapper?.querySelector(".button-copy-text");
    if (!input) return;

    try {
      await navigator.clipboard.writeText(input.value);
      showCopied(wrapper, action);
    } catch (error) {
      // clipboard api unavailable (e.g. insecure context): select the text
      // so the user can copy it manually
      console.error("Could not copy text: ", error);
      input.select();
    }
  });
}
