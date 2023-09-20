import SubscribeButton from "./subscribeButton.js";
import RelativeDate from "./relativeDate.js";
import { Storage } from "./storage.js";
import { Sorting, Sortings, SortingObjects } from "./sortings.js";
import { vif, t, longest, createSetter } from "./utils.js";
import { RSSData, RSSDataItem } from "./rssDataType.js";
import { setTheme, getTheme } from "./theme.js";

const DEFAULT_CHARSET = "utf-8";

window.customElements.define("subscribe-button", SubscribeButton);
window.customElements.define("relative-date", RelativeDate, {
	extends: "time",
});

async function render({
	data,
	url,
}: {
	data: RSSData;
	url: string;
}): Promise<string> {
	const store = await Storage.getAll();
	return `
		<header class="header body__header">
			${vif(
				() => data.image,
				(url) => `<img class="header__image" src="${url}"/>`
			)}
			${vif(
				() => t(data, ".url", null, t.escape),
				(mainUrl) =>
					`<h1 class="header__title"><a class="header__main-url" href="${mainUrl}">${t(
						data,
						".title",
						"",
						t.escape
					)}</a><subscribe-button class="header__subscribe" link="${url}"></subsribe-button></h1>`,
				() =>
					`<h1 class="header__title"><span class="header__title-span">${t(
						data,
						".title",
						"",
						t.escape
					)}</span><subscribe-button class="header__subscribe" link="${url}"></subsribe-button></h1>`
			)}
			<div class="header__links">
				<a class="header__original-url" href="${url}">${url}</a><a class="header__original-url-source" href="view-source:${url}">source</a>
			</div>
			${vif(
				() => t(data, ".description", null, t.escape),
				(description) => `<p class="header__description">${description}</p>`
			)}
		</header>
		<main class="main body__main">
			<div class="controls main__controls">
				<label class="items-sort">
					<span class="items-sort__label">Sort:</span> <select class="items-sort__select">
						${Sortings.map(
							(sort) =>
								`<option value="${sort}" ${
									sort === store.sort ? "selected" : ""
								}>${SortingObjects[sort].label}</option>`
						).join("")}
					<select>
				</label>
				<div class="controls__spacer"></div>
				<label class="controls__relative-time-switch"><input class="relative-time-checkbox controls__relative-time-checkbox" type="checkbox" ${
					store.useRelativeTime === true ? "checked" : ""
				}>relative time</label>
			</div>
			<div class="items" id="items">
				${data.items
					.map(
						(item, index) => `
							<article class="item items__item" data-index="${index}" data-datetime="${vif(
							() => item.date!.getTime(),
							(date) => date,
							() => 0
						)}">
								<header class="item__header">
									${vif(
										() => item.image,
										(url) => `<img class="item__image" src="${url}"/>`
									)}
									<h2 class="item__title">
										${vif(
											() => t(item, ".url", null, t.escape),
											(link) => `
												<a class="noline" href="${link}">
													${t(item, ".title", "Untitled", t.escape)}
												</a>
											`,
											() => t(item, ".title", "Untitled", t.escape)
										)}
									</h2>
									<p class="item__info">
										${vif(
											() => item.date!,
											(date) => `
												<time
													is="relative-date"
													data-relative="${store.useRelativeTime}"
													class="item__pubDate"
													datetime="${date}"
													title="${date}"
												>
													${date}
												</time>
											`
										)}
										${vif(
											() => t(item, ".author", null, t.escape),
											(author) =>
												`<span class="item__author">by ${author}</span>`
										)}
									</p>
									<div style="clear: both;"></div>
								</header>
								<div class="content item__content" data-content="${item.id}"></div>
								<div style="clear: both;"></div>
								${vif(
									() => item.media,
									(media) => {
										if (media!.type.indexOf("image/") === 0) {
											const eurl = t(media as any, ".url", "", t.escape);
											const link = `<a href="${eurl}">${
												media!.name || "link"
											}</a>`;
											return `
												<div class="item__media">
													<h4 class="item__media-title">Media ${link}</h4>
													<img
														class="item__media-element item__media-element-image"
														src="${eurl}"
													/>
												</div>`;
										}
										const strtype =
											media!.type.indexOf("audio/") === 0 ? "audio" : "video";
										const eurl = t(media as any, ".url", "", t.escape);
										const link = `<a href="${eurl}">${
											media!.name || "link"
										}</a>`;
										return `
											<div class="item__media">
													<h4 class="item__media-title">Media ${link}</h4>
													<${strtype}
														controls
														class="item__media-element item__media-element-${strtype}"
														preload="none"
														src="${eurl}"
														type="${t(media as any, ".type", "", t.escape)}"
													/>
											</div>`;
									}
								)}
								${vif(
									() => t(item, ".url", "", t.escape),
									(link) => `<a class="item__bottom-link" href="${link}"></a>`
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

async function setThemeSwitching(): Promise<void> {
	const switcher = document.createElement("div");
	switcher.classList.add("theme-switch");
	document.body.appendChild(switcher);

	const theme = await getTheme();
	document.documentElement.dataset.theme = theme.id;
	const themeImg = document.createElement("img");
	themeImg.classList.add("theme-switch__img");
	themeImg.src = "./icons/" + theme.img;

	Storage.subscribe(async (changes) => {
		if (changes.theme) {
			const theme = await getTheme();
			document.documentElement.dataset.theme = theme.id;
			themeImg.src = "./icons/" + theme.img;
		}
	});

	switcher.appendChild(themeImg);
	switcher.addEventListener("click", async () => {
		const nt = (await getTheme()).id === "day" ? "night" : "day";
		setTheme(nt);
		const theme = await getTheme();
		themeImg.src = "./icons/" + theme.img;
	});
}

function findCurrentArticle(): HTMLElement | null {
	const center = document.body.clientWidth / 2;
	const height = document.body.clientHeight;
	let startPosition = 0;
	while (startPosition <= height) {
		const target = document
			.elementsFromPoint(center, startPosition)
			.find((x) => x.matches(".item"));
		if (target) return target as HTMLElement;
		startPosition += 10;
	}
	return null;
}

async function setHotkeyNavigation(): Promise<void> {
	document.addEventListener("keydown", (e) => {
		switch (e.keyCode) {
			// <-, j
			case 37:
			case 74: {
				e.preventDefault();
				const currentEl = findCurrentArticle();
				if (!currentEl) return;
				const rect = currentEl.getBoundingClientRect();
				const next =
					(rect as any).y < -2 ? currentEl : currentEl.previousElementSibling;
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
				const next =
					(rect as any).y > 2 ? currentEl : currentEl.nextElementSibling;
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

/**
 *
 * @param tag xml tag (i.e "<?xml encoding="UTF-8"?>)
 */
function getXMLCharset(tag: string): string | null {
	const reg = /encoding=("|')(\S*)?("|')/i;
	const matches = tag.match(reg);
	if (!matches) return null;
	if (matches.length < 3) return null;
	return matches[2].toLocaleLowerCase();
}

/**
 * Tries to instantiate TextDecoder, and returns utf-8 decoder on fail
 *
 * @param enc encoding
 */
function getSafeDecoder(enc: string): TextDecoder {
	try {
		return new TextDecoder(enc);
	} catch {
		return new TextDecoder("utf-8");
	}
}

function parseXML(
	input: ArrayBuffer,
	presumedCharset: string = DEFAULT_CHARSET
): RSSData {
	const utfdec = getSafeDecoder(presumedCharset);
	let string = utfdec.decode(input);
	const data = {} as RSSData;
	const xmlHeaderIndex = string.indexOf("<?xml");
	const xmlHeaderEndIndex =
		xmlHeaderIndex === -1 ? null : string.indexOf("?>", xmlHeaderIndex);
	const xmlTag =
		xmlHeaderIndex === -1
			? null
			: string.substr(xmlHeaderIndex, xmlHeaderEndIndex! + 2);

	// convert input again if presumed encoding and xml header encoding don't match
	if (xmlTag) {
		const enc = getXMLCharset(xmlTag);
		if (enc && enc !== presumedCharset) {
			const dec = getSafeDecoder(enc);
			try {
				string = dec.decode(input);
			} catch {}
		}
	}

	const dom = new DOMParser().parseFromString(
		string.substr(xmlHeaderIndex === -1 ? 0 : xmlHeaderIndex),
		"text/xml"
	);
	if (dom.documentElement.tagName === "parsererror")
		throw new Error("XML corrupted");
	vif(() => t(dom, ">image>url:"), createSetter(data, "image"));
	vif(
		() =>
			t(dom, ">link\\:not([rel]):") || t(dom, ">link:") || t(dom, ">link^href"),
		createSetter(data, "url")
	);
	data.title = t(dom, ">title:", "Untitled");

	vif(
		() => longest(t(dom, ">description:", ""), t(dom, ">subtitle:", "")),
		createSetter(data, "description")
	);

	let items = Array.from(dom.querySelectorAll("item"));
	if (items.length === 0) items = Array.from(dom.querySelectorAll("entry"));

	data.items =
		items.map((item) => {
			const parsed = {
				id: Math.random().toFixed(16).substring(2),
			} as RSSDataItem;
			vif(
				() =>
					t(item, ">pubDate:") || t(item, ">published:") || t(item, ">date:"),
				(date) => createSetter(parsed, "date")(new Date(date))
			);

			vif(
				() =>
					t(item, ">link:") ||
					t(item, ">guid[isPermalink='true']:") ||
					t(item, ">link^href"),
				createSetter(parsed, "url")
			);

			let baseURL = "";
			if (parsed.url) {
				const url = new URL(parsed.url);
				baseURL = url.origin;
			}

			console.log(baseURL);

			parsed.title = t(item, ">title:", "Untitled");

			vif(
				() =>
					t(item, ">author>name:") ||
					t(item, ">author>email:") ||
					t(item, ">author:") ||
					t(item, ">creator:"),
				createSetter(parsed, "author")
			);

			vif(
				() =>
					longest(
						t(item, ">encoded:"),
						t(item, ">description:"),
						t(item, ">content:"),
						t(item, ">summary:")
					),
				(content) => {
					const doc = document.implementation.createHTMLDocument();
					const base = document.createElement("base");
					base.href = baseURL;
					doc.head.appendChild(base);
					doc.body.innerHTML = content;
					const links = doc.body.querySelectorAll("a");
					for (let link of Array.from(links)) {
						// transforming relative url to absolute url
						link.href = link.href;
					}
					parsed.content = doc.body.innerHTML;
				}
			);

			vif(
				() => t(item, ">enclosure"),
				(media) => {
					const out = {} as {
						type: string | "";
						url: string | "";
						name: string | "";
					};
					out.type = t(media as any, "^type");
					out.url = t(media as any, "^url");
					out.name = !out.url
						? ""
						: new URL(out.url).pathname
								.split("/")
								.reverse()
								.find((x) => x.length > 0) || "";
					parsed.media = out;
				}
			);

			return parsed;
		}) || [];
	return data;
}

function parseJSON(json: any): RSSData {
	const data = {} as RSSData;
	data.title = t(json, ".title", "Untitled");
	vif(() => json.home_page_url, createSetter(data, "url"));
	vif(() => json.icon, createSetter(data, "image"));

	try {
		data.items = json.items.map((item: any) => {
			const out = {} as RSSDataItem;
			out.title = t(item, ".title", "Untitled");
			vif(() => item.url, createSetter(out, "url"));
			vif(() => item.image, createSetter(out, "image"));
			vif(
				() => item.date_published || item.date_modified,
				(date) => createSetter(out, "date")(new Date(date))
			);
			vif(() => item.content_html, createSetter(out, "content"));
			return out;
		});
	} catch (e) {
		data.items = [];
	}

	return data;
}

/**
 * Parses charset out of Content-Type header;
 *
 * @param input content-type header (i.e. "application/xml; charset=ISO-8859-1")
 */
function getCharset(input: string | null): string {
	if (!input) return DEFAULT_CHARSET;
	const reg = /charset='?(.*?)'?$/i;
	const matches = input.match(reg);
	if (!matches) return DEFAULT_CHARSET;
	if (matches.length < 2) return DEFAULT_CHARSET;
	return matches[1].toLocaleLowerCase();
}

async function main(): Promise<void> {
	let url = decodeURI(window.location.search.substr(5));
	if (url.indexOf("ext%2Brss%3A") === 0) {
		url = decodeURIComponent(url.substr(12));
		window.location.replace("/show.html?url=" + encodeURI(url));
	}

	setThemeSwitching();

	setHotkeyNavigation();

	let resp: Response;
	try {
		resp = await fetch(url, {
			headers: {
				"Cache-Control": "no-cache",
				"If-None-Match": "",
				Pragma: "no-cache",
			},
		});
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

	let data: RSSData;
	try {
		const type = resp.headers.get("Content-Type");
		if (type!.includes("xml")) {
			data = parseXML(
				await resp.arrayBuffer(),
				getCharset(resp.headers.get("content-type"))
			);
		} else if (type!.includes("json")) {
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
		(description) => (document.title = description!)
	);
	const fr = document.createElement("template");
	fr.innerHTML = await render({ data, url });
	container.append(fr.content);

	const sortArticles = (sort: Sorting) => {
		const articleContainer = document.getElementById("items")!;
		const articles = articleContainer.querySelectorAll(":scope > .item");

		Array.from(articles)
			.sort(SortingObjects[sort].fn as any)
			.forEach((x, i) => {
				(x as HTMLElement).dataset.sortIndex = i.toString();
				articleContainer.appendChild(x);
			});
	};
	const sort = await Storage.get("sort");
	if (sort !== "none") sortArticles(sort);

	Storage.subscribe((changes) => {
		if (changes.hasOwnProperty("useRelativeTime")) {
			document.querySelectorAll("time[is='relative-date']").forEach((el) => {
				(el as HTMLElement).dataset.relative =
					changes.useRelativeTime!.newValue.toString();
			});
		}
	});

	document
		.querySelector(".relative-time-checkbox")!
		.addEventListener("change", async (e) => {
			Storage.set("useRelativeTime", (e.target as HTMLInputElement).checked);
		});

	document
		.querySelector(".items-sort__select")!
		.addEventListener("change", async (e) => {
			const sort = (e.target as HTMLInputElement).value as Sorting;
			Storage.set("sort", sort);
			sortArticles(sort);
		});

	unwrapVisibleItems(data.items);

	window.addEventListener(
		"scroll",
		throttle(() => {
			unwrapVisibleItems(data.items);
		}, 150)
	);
}

function unwrapVisibleItems(rssitems: RSSDataItem[]) {
	const items = Array.from(
		document.querySelectorAll(".item")
	) as HTMLDivElement[];
	for (const item of items) {
		if (elementIsVisible(item)) {
			unwrapVisibleContent(item, rssitems);
		}
	}
}

function unwrapVisibleContent(item: HTMLDivElement, rssitems: RSSDataItem[]) {
	const contentEl = item.querySelector(".item__content") as HTMLDivElement;
	if (!contentEl) return;
	const id = contentEl.dataset.content;
	const data = rssitems.find((x) => x.id === id);
	if (!data) return;
	contentEl.innerHTML = data.content ?? "";
	delete contentEl.dataset.content;
}

function elementIsVisible(el: HTMLElement) {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <=
			(window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

const throttle = (fn: () => void, delay: number): (() => void) => {
	let wait = false;
	let trailing = false;
	return () => {
		trailing = true;
		if (wait) return;

		const val = fn();

		wait = true;

		window.setTimeout(() => {
			wait = false;
			if (trailing) {
				fn();
				trailing = false;
			}
		}, delay);

		return val;
	};
};

main().catch((e) => {
	console.error(e);
});
