import SubscribeButton from "./subscribeButton.js";
import RelativeDate from "./relativeDate.js";
import store from "./storage.js";
import { vif, t, longest, setProp } from "./utils.js";

window.customElements.define("subscribe-button", SubscribeButton);
window.customElements.define("relative-date", RelativeDate, {
	extends: "time",
});

const Sortings = {
	none: {
		label: "None",
		fn: (a, b) => {
			try {
				const pa = parseInt(a.dataset.index, 10);
				const pb = parseInt(b.dataset.index, 10);
				if (pa == pb) return 0;
				return pa < pb ? -1 : 1;
			} catch (e) {
				return 0;
			}
		},
	},
	"date desc": {
		label: "Newest",
		fn: (a, b) => {
			try {
				const pa = parseInt(a.dataset.datetime, 10);
				const pb = parseInt(b.dataset.datetime, 10);
				if (pa == pb) return 0;
				return pa < pb ? 1 : -1;
			} catch (e) {
				return 0;
			}
		},
	},
	"date asc": {
		label: "Oldest",
		fn: (a, b) => Sortings["date desc"].fn(a, b) * -1,
	},
};
const SortingsList = ["none", "date desc", "date asc"];

function render({ data, url }) {
	return `
		<header class="header body__header">
			${vif(() => data.image, url => `<img class="header__image" src="${url}"/>`)}
			${vif(
				() => data.url,
				mainUrl =>
					`<h1 class="header__title"><a class="header__main-url" href="${mainUrl}">${
						data.title
					}</a><subscribe-button class="header__subscribe" link="${url}"></subsribe-button></h1>`,
				() =>
					`<h1 class="header__title"><span class="header__title-span">${
						data.title
					}</span><subscribe-button class="header__subscribe" link="${url}"></subsribe-button></h1>`
			)}
			<div class="header__links">
				<a class="header__original-url" href="${url}">${url}</a><a class="header__original-url-source" href="view-source:${url}">source</a>
			</div>
			${vif(
				() => data.description,
				description => `<p class="header__description">${description}</p>`
			)}
		</header>
		<main class="main body__main">
			<div class="controls main__controls">
				<label class="items-sort">
					<span class="items-sort__label">Sort:</span> <select class="items-sort__select">
						${SortingsList.map(
							sort =>
								`<option value="${sort}" ${
									sort === store.sort ? "selected" : ""
								}>${Sortings[sort].label}</option>`
						).join("")}
					<select>
				</label>
				<div class="controls__spacer"></div>
				<label class="controls__relative-time-switch"><input class="relative-time-checkbox controls__relative-time-checkbox" type="checkbox" ${
					store.useRelativeTime === "true" ? "checked" : ""
				}>relative time</label>
			</div>
			<div class="items" id="items">
				${data.items
					.map(
						(item, index) => `
							<article class="item items__item" data-index="${index}" data-datetime="${vif(
							() => item.date.getTime(),
							date => date,
							() => 0
						)}">
								<header class="item__header">
									${vif(() => item.image, url => `<img class="item__image" src="${url}"/>`)}
									<h2 class="item__title">
										${vif(
											() => item.url,
											link => `
												<a class="noline" href="${link}">
													${t(item, ".title", "Untitled")}
												</a>
											`,
											() => t(item, ".title", "Untitled")
										)}
									</h2>
									<p class="item__info">
										${vif(
											() => item.date.toLocaleString(),
											date =>
												`
												<time
													is="relative-date"
													data-relative="${store.useRelativeTime}"
													class="item__pubDate"
													datetime="${date}"
													title="${date}"
												>
													${date}
												</time>`
										)}
										${vif(
											() => item.author,
											author => `<span class="item__author">by ${author}</span>`
										)}
									</p>
									<div style="clear: both;"></div>
								</header>
								<div class="content item__content">${t(item, ".content")}</div>
								<div style="clear: both;"></div>
								${vif(
									() => item.media,
									media => {
										if (media.type.indexOf("image/") === 0) {
											return `
												<div class="item__media">
													<h4 class="item__media-title">Media</h4>
													<img
														class="item__media-element item__media-element-image"
														src="${t(media, ".url")}"
													/>
												</div>`;
										}
										const strtype = media.type.indexOf("audio/" === 0)
											? "audio"
											: "video";
										return `
											<div class="item__media">
													<h4 class="item__media-title">Media</h4>
													<${strtype}
														controls
														class="item__media-element item__media-element-${strtype}"
														preload="none"
														src="${t(media, ".url")}"
														type="${t(media, ".type")}"
													/>
											</div>`;
									}
								)}
								${vif(
									() => item.url,
									link => `<a class="item__bottom-link" href="${link}"></a>`
								)}
							</article>
				`
					)
					.join("")}
			</div>
		</main>
		<footer class="footer body__footer">
			<hr/>
			<a href="https://github.com/Reeywhaar/want-my-rss">Want My RSS</a>
		</footer>
	`;
}

const Themes = {
	day: {
		id: "day",
		img: "moon.svg",
	},
	night: {
		id: "night",
		img: "sun.svg",
	},
};

async function setThemeSwitching() {
	const getTheme = () => {
		return Themes[store.theme];
	};

	let switchCounter = 0;

	const setTheme = themeName => {
		store.theme = themeName;
		document.documentElement.classList.add("switch-transition");
		++switchCounter;
		setTimeout(() => {
			document.documentElement.dataset.theme = themeName;
		}, 10);
		setTimeout(() => {
			--switchCounter;
			if (switchCounter < 1) {
				document.documentElement.classList.remove("switch-transition");
			}
		}, 1500);
	};

	const switcher = document.createElement("div");
	switcher.classList.add("theme-switch");
	document.body.appendChild(switcher);

	store.subscribe((prop, v) => {
		if (prop === theme) {
			document.documentElement.dataset.theme = v;
		}
	});

	const theme = getTheme();
	document.documentElement.dataset.theme = theme.id;
	const themeImg = document.createElement("img");
	themeImg.classList.add("theme-switch__img");
	themeImg.src = "./icons/" + theme.img;

	window.addEventListener("focus", () => {
		const theme = getTheme();
		document.documentElement.dataset.theme = theme.id;
		themeImg.src = "./icons/" + theme.img;
	});

	switcher.appendChild(themeImg);
	switcher.addEventListener("click", () => {
		const nt = getTheme().id === "day" ? "night" : "day";
		setTheme(nt);
		themeImg.src = "./icons/" + Themes[nt].img;
	});
}

function findCurrentArticle() {
	const center = document.body.clientWidth / 2;
	const height = document.body.clientHeight;
	let startPosition = 0;
	while (startPosition <= height) {
		const target = document
			.elementsFromPoint(center, startPosition)
			.find(x => x.matches(".item"));
		if (target) return target;
		startPosition += 10;
	}
	return null;
}

async function setHotkeyNavigation() {
	document.addEventListener("keydown", e => {
		switch (e.keyCode) {
			// <-, j
			case 37:
			case 74: {
				e.preventDefault();
				const currentEl = findCurrentArticle();
				if (!currentEl) return;
				const rect = currentEl.getBoundingClientRect();
				const next = rect.y < -2 ? currentEl : currentEl.previousElementSibling;
				if (!next) {
					window.scrollTo({
						top: 0,
						behavior: "smooth",
					});
				} else {
					next.scrollIntoView({ behavior: "smooth", block: "start" });
				}
				break;
			}
			// ->, k
			case 39:
			case 75: {
				e.preventDefault();
				const currentEl = findCurrentArticle();
				if (!currentEl) return;
				const rect = currentEl.getBoundingClientRect();
				const next = rect.y > 2 ? currentEl : currentEl.nextElementSibling;
				if (next) {
					next.scrollIntoView({ behavior: "smooth", block: "start" });
				} else {
					window.scrollTo({
						top: document.body.scrollHeight,
						behavior: "smooth",
					});
				}
				break;
			}
		}
	});
}

function parseXML(string) {
	const data = {};
	const dom = new DOMParser().parseFromString(string, "text/xml");
	if (dom.documentElement.tagName === "parsererror")
		throw new Error("XML corrupted");

	vif(() => t(dom, ">image>url:"), setProp(data, "image"));
	vif(
		() =>
			t(dom, ">link\\:not([rel]):") || t(dom, ">link:") || t(dom, ">link^href"),
		setProp(data, "url")
	);
	data.title = t(dom, ">title:", "Untitled");

	vif(
		() => longest(t(dom, ">description:"), t(dom, ">subtitle:")),
		setProp(data, "description")
	);

	let items = Array.from(dom.querySelectorAll("item"));
	if (items.length === 0) items = Array.from(dom.querySelectorAll("entry"));

	data.items =
		items.map(item => {
			const parsed = {};
			vif(
				() =>
					t(item, ">pubDate:") || t(item, ">published:") || t(item, ">date:"),
				date => setProp(parsed, "date")(new Date(date))
			);

			vif(
				() =>
					t(item, ">link:") ||
					t(item, ">guid[isPermalink='true']:") ||
					t(item, ">link^href"),
				setProp(parsed, "url")
			);

			parsed.title = t(item, ">title:", "Untitled");

			vif(
				() =>
					t(item, ">author>name:") ||
					t(item, ">author>email:") ||
					t(item, ">author:") ||
					t(item, ">creator:"),
				setProp(parsed, "author")
			);

			vif(
				() =>
					longest(
						t(item, ">encoded:"),
						t(item, ">description:"),
						t(item, ">content:")
					),
				setProp(parsed, "content")
			);

			vif(
				() => t(item, ">enclosure"),
				media => {
					const out = {};
					out.type = t(media, "^type");
					out.url = t(media, "^url");
					setProp(parsed, "media")(out);
				}
			);

			return parsed;
		}) || [];

	return data;
}

function parseJSON(json) {
	const data = {};
	data.title = t(json, ".title", "Untitled");
	vif(() => json.home_page_url, setProp(data, "url"));
	vif(() => json.icon, setProp(data, "image"));

	try {
		data.items = json.items.map(item => {
			const out = {};
			out.title = t(item, ".title", "Untitled");
			vif(() => item.url, setProp(out, "url"));
			vif(() => item.image, setProp(out, "image"));
			vif(
				() => item.date_published || item.date_modified,
				date => setProp(out, "date")(new Date(date))
			);
			vif(() => item.content_html, setProp(out, "content"));
			return out;
		});
	} catch (e) {
		data.items = [];
	}

	return data;
}

async function main() {
	setThemeSwitching();

	setHotkeyNavigation();

	const url = decodeURI(window.location.search.substr(5));
	let resp;
	try {
		resp = await fetch(url);
		if (resp.status >= 400) {
			const notFound = document.createElement("div");
			notFound.innerHTML = `
				<div>
					<h1>404</h1>
					<p>Feed <a href="${url}">${url}</a> not found</p>
				</div>
			`;
			document.body.appendChild(notFound);
			return;
		}
	} catch (e) {
		const error = document.createElement("div");
		error.innerHTML = `
				<div>
					<h1>Error</h1>
					<p>Error while fetching feed</p>
					<a href="${url}">${url}</a>
				</div>
			`;
		document.body.appendChild(error);
		return;
	}

	let data;
	try {
		const type = resp.headers.get("Content-Type");
		if (type.includes("xml")) {
			data = parseXML(await resp.text());
		} else if (type.includes("json")) {
			data = parseJSON(await resp.json());
		} else {
			throw new Error("Unsopported format");
		}
		data.feedUrl = url;
	} catch (e) {
		const error = document.createElement("div");
		error.innerHTML = `
				<div>
					<h1>Error</h1>
					<p>Error while parsing feed</p>
					<a href="${url}">${url}</a>
				</div>
			`;
		document.body.appendChild(error);
		console.error(e);
		return;
	}

	const container = document.body;
	vif(
		() => data.title || data.description,
		description => (document.title = description)
	);
	const fr = document.createElement("template");
	fr.innerHTML = render({ data, url });
	container.append(fr.content);

	const sortArticles = sort => {
		const articleContainer = document.getElementById("items");
		const articles = articleContainer.querySelectorAll(":scope > .item");

		Array.from(articles)
			.sort(Sortings[sort].fn)
			.forEach((x, i) => {
				x.dataset.sortIndex = i;
				articleContainer.appendChild(x);
			});
	};
	if (store.sort !== "none") sortArticles(store.sort);

	store.subscribe((prop, value) => {
		if (prop === "use-relative-time") {
			document.querySelectorAll("time[is='relative-date']").forEach(el => {
				el.dataset.relative = value;
			});
		}
	});

	document
		.querySelector(".relative-time-checkbox")
		.addEventListener("change", e => {
			store.useRelativeTime = e.target.checked.toString();
		});

	document
		.querySelector(".items-sort__select")
		.addEventListener("change", e => {
			store.sort = e.target.value;
			sortArticles(e.target.value);
		});
}

main().catch(e => {
	console.error(e);
});
