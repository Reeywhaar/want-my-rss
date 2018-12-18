const links = JSON.parse(
	decodeURIComponent(window.location.search.substr("7"))
);

const template = document.getElementById("item");

const types = {
	"application/rss+xml": "rss",
	"application/atom+xml": "atom",
	"application/json": "json",
};

document.addEventListener("click", e => {
	if (!(e.which === 1 || e.which === 2)) return;
	e.preventDefault();
	if (e.target.dataset.url) {
		browser.runtime.sendMessage({
			action: "open-tab",
			url: browser.runtime.getURL(e.target.dataset.url),
			newTab: e.which === 2 || e.metaKey,
		});
	}
});

const elements = links.map(el => {
	const content = template.content.cloneNode(true);
	const link = content.querySelector(".items__item-link");
	const extURL = browser.runtime.getURL(`show.html?url=${encodeURI(el.url)}`);
	link.href = el.url;
	link.dataset.url = extURL;
	link.innerHTML =
		(el.title || el.url) +
		(types[el.type]
			? ` <span style="opacity:0.6;">(${types[el.type]})</span>`
			: "");
	return content;
});

const fragment = document.createDocumentFragment();
elements.forEach(el => {
	fragment.appendChild(el);
});

document.querySelector(".items").appendChild(fragment);
