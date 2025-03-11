(function () {
  const data = Array.from(
    document.querySelectorAll(
      "link[rel*=alternate][href]:is([type*=atom],[type*=rss],[type='application/json'],[type='application/feed+json'])"
    ) as NodeListOf<HTMLLinkElement>
  ).map((el) => ({
    type: el.getAttribute("type"),
    url: el.href,
    title: el.title || null,
  }));

  return {
    url: window.location.href,
    data,
  } as import("./pageReturnType.js").Return;
})();
