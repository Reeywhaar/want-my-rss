import SubscribeButton from "./subscribeButton.js";

window.customElements.define("subscribe-button", SubscribeButton);

/**
 * takes predicate and if it is not falsy then pass it
 * as first argument to fn, if falsy then fnNot will be
 * called with no arguments
 *
 * used as rendering helper
 */
function vif(predicate, fn, fnNot = () => "") {
	let l;
	try {
		l = predicate();
	} catch (e) {}
	if (l) {
		return fn(l);
	}
	return fnNot();
}

/**
 * mappers for query params for "t" function
 */
const accessMappers = {
	">": (el, prop) => el.querySelector(":scope " + prop),
	"^": (el, prop) => el.getAttribute(prop),
	":": el => el.textContent,
	"%": el => el.innerHTML,
};

/**
 * t stands for "trace"
 *
 * t is a traversal tool for xml type documents
 *
 * @param {any} el
 * @param {String} query
 */
function t(el, query) {
	try {
		let action;
		let current;
		let isEscape = false;
		for (let char of query) {
			if (char === "\\") {
				isEscape = true;
				continue;
			}
			if (accessMappers.hasOwnProperty(char) && !isEscape) {
				if (typeof action !== "undefined") {
					el = action(el, current);
					current = undefined;
				}
				action = accessMappers[char];
			} else {
				if (typeof current === "undefined") current = "";
				current += char;
			}
			isEscape = false;
		}
		return action(el, current) || "";
	} catch (e) {
		return "";
	}
}

function render(context) {
	return `
		<header class="header body__header">
			${vif(
				() => t(context.root, ">image>url:"),
				url => `<img class="header__image" src="${url}"/>`
			)}
			${vif(
				() =>
					t(context.root, ">link\\:not([rel]):") || t(context.root, ">link:"),
				url =>
					`<h1 class="header__title"><a class="header__main-url" href="${url}">${t(
						context.root,
						">title:"
					) ||
						"Untitled"}</a><subscribe-button class="header__subscribe" link="${
						context.url
					}"></subsribe-button></h1>`,
				() =>
					`<h1 class="header__title">${t(context.root, ">title:") ||
						"Untitled"}<subscribe-button class="header__subscribe" link="${
						context.url
					}"></subsribe-button></h1>`
			)}
			<div class="header__links">
				<a class="header__original-url" href="${context.url}">${
		context.url
	}</a><a class="header__original-url-source" href="view-source:${
		context.url
	}">source</a>
			</div>
			${vif(
				() => t(context.root, ">description:"),
				description =>
					`<p class="header__description">${vif(
						() => t(context.root, ">subtitle:"),
						description => `${description}<br/>`
					)}${description}</p>`
			)}
		</header>
		<main class="main body__main">
			<div class="items">
				${context.items
					.map(
						(item, index) => `
					<article class="item items__item" data-index="${index}">
						<header class="item__header">
							<h2 class="item__title">
								${vif(
									() =>
										t(item, ">link:") ||
										t(item, ">guid[isPermalink='true']:") ||
										t(item, ">link^href"),
									link => `<a class="noline" href="${link}">
									${t(item, ">title:") || "Untitled"}
								</a>`,
									() => t(item, ">title:") || "Untitled"
								)}
							</h2>
							<p class="item__info">
								${vif(
									() =>
										t(item, ">pubDate:") ||
										t(item, ">published:") ||
										t(item, ">date:"),
									date =>
										`<time class="item__pubDate" datetime="${date}">${date}</time>`
								)}
								${vif(
									() =>
										t(item, ">author>name:") ||
										t(item, ">author>email:") ||
										t(item, ">author:") ||
										t(item, ">creator:"),
									author => `<span class="item__author">by ${author}</span>`
								)}
							</p>
						</header>
						<div class="content item__content">${t(item, ">description:") ||
							t(item, ">content:")}</div>
						${vif(
							() => t(item, ">enclosure"),
							media => {
								try {
									const type = t(media, "^type");
									if (type.indexOf("image/") === 0) {
										return `<div class="item__media">
											<h4 class="item__media-title">Media</h4>
											<img class="item__media-element item__media-element-image" src="${t(
												media,
												"^url"
											)}">
											</div>
											`;
									}
									const strtype = type.indexOf("audio/" === 0)
										? "audio"
										: "video";
									return `<div class="item__media">
											<h4 class="item__media-title">Media</h4>
											<${strtype} controls class="item__media-element item__media-element-${strtype}" preload="none" src="${t(
										media,
										"^url"
									)}" type="${type}"/>
										</div>`;
								} catch (e) {
									return "";
								}
							}
						)}
						${vif(
							() =>
								t(item, ">link:") ||
								t(item, ">guid[isPermalink='true']:") ||
								t(item, ">link^href"),
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

function getTheme() {
	const stored = localStorage.getItem("theme");
	if (Themes.hasOwnProperty(stored)) return Themes[stored];
	return Themes["day"];
}

let switchCounter = 0;

function setTheme(themeName) {
	localStorage.setItem("theme", themeName);
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
}

async function setThemeSwitching() {
	const switcher = document.createElement("div");
	switcher.classList.add("theme-switch");
	document.body.appendChild(switcher);

	const theme = getTheme();
	document.documentElement.dataset.theme = theme.id;
	const themeImg = document.createElement("img");
	themeImg.classList.add("theme-switch__img");
	themeImg.src = "./" + theme.img;

	window.addEventListener("focus", () => {
		const theme = getTheme();
		document.documentElement.dataset.theme = theme.id;
		themeImg.src = "./" + theme.img;
	});

	switcher.appendChild(themeImg);
	switcher.addEventListener("click", () => {
		const nt = getTheme().id === "day" ? "night" : "day";
		setTheme(nt);
		themeImg.src = "./" + Themes[nt].img;
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
			// j
			case 74: {
				e.preventDefault();
				const currentEl = findCurrentArticle();
				if (!currentEl) return;
				const index = parseInt(currentEl.dataset.index, 10);
				if (index === 0) {
					window.scrollTo({
						top: 0,
						behavior: "smooth",
					});
				} else {
					const next = document.querySelector(
						`.item[data-index="${index - 1}"]`
					);
					next.scrollIntoView({ behavior: "smooth", block: "start" });
				}
				break;
			}
			// k
			case 75: {
				e.preventDefault();
				const currentEl = findCurrentArticle();
				if (!currentEl) return;
				const index = parseInt(currentEl.dataset.index, 10);
				const next = document.querySelector(`.item[data-index="${index + 1}"]`);
				if (!next) return;
				next.scrollIntoView({ behavior: "smooth", block: "start" });
				break;
			}
		}
	});
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
				</div>
			`;
		document.body.appendChild(error);
		return;
	}
	const data = new DOMParser().parseFromString(await resp.text(), "text/xml");
	const container = document.body;
	vif(
		() => t(data, ">title:") || t(data, ">descripiton:"),
		description => (document.title = description)
	);
	let items = Array.from(data.querySelectorAll("item"));
	if (items.length === 0) {
		items = Array.from(data.querySelectorAll("entry"));
	}
	const fr = document.createElement("template");
	fr.innerHTML = render({ root: data, items: items, url });
	container.append(fr.content);
}

main().catch(e => {
	console.error(e);
});
