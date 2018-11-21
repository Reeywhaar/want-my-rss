const links = JSON.parse(
	decodeURIComponent(window.location.search.substr("7"))
);

const template = document.getElementById("item");

const types = {
	"application/rss+xml": "rss",
	"application/atom+xml": "atom",
	"application/json": "json",
};

const elements = links.map(el => {
	const content = template.content.cloneNode(true);
	const link = content.querySelector(".items__item-link");
	link.href = browser.runtime.getURL(`show.html?url=${encodeURI(el.url)}`);
	link.innerHTML =
		(el.title || el.url) +
		(types[el.type]
			? ` <span style="opacity:0.6;">(${types[el.type]})</span>`
			: "");
	link.addEventListener("click", e => {
		e.preventDefault();
		browser.runtime.sendMessage({
			action: "open-tab",
			url: browser.runtime.getURL(`show.html?url=${encodeURI(el.url)}`),
			newTab: e.metaKey,
		});
	});
	return content;
});

const fragment = document.createDocumentFragment();
elements.forEach(el => {
	fragment.appendChild(el);
});

document.querySelector(".items").appendChild(fragment);
