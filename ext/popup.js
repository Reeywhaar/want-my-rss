const links = JSON.parse(
	decodeURIComponent(window.location.search.substr("7"))
);

const template = document.getElementById("item");

const elements = links.map(el => {
	const content = template.content.cloneNode(true);
	const link = content.querySelector(".items__item-link");
	link.href = browser.runtime.getURL(`show.html?url=${encodeURI(el.url)}`);
	link.innerText = el.title || el.url;
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
