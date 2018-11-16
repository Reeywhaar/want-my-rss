(() => {
	const data = Array.from(
		document.head.querySelectorAll("link[rel='alternate']")
	).map(el => ({
		url: el.href,
		title: el.title || null,
	}));

	return {
		url: window.location.href,
		data,
	};
})();
