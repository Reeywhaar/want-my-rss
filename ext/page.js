(() => {
	const data = Array.from(
		document.head.querySelectorAll("link[rel='alternate']")
	)
		.filter(el => {
			if (!el.hasAttribute("type")) return false;
			if (!el.hasAttribute("href")) return false;
			const type = el.getAttribute("type");
			if (type.indexOf("rss") !== -1 || type.indexOf("atom") !== -1)
				return true;
			return false;
		})
		.map(el => ({
			url: el.href,
			title: el.title || null,
		}));

	return {
		url: window.location.href,
		data,
	};
})();
