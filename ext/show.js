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
				current += char;
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

function enableMedia(fragment) {
	const root = document.createElement("div");
	try {
		root.innerHTML = fragment;
		const audios = root.querySelectorAll("audio, video");
		for (let el of audios) {
			el.controls = true;
		}
	} finally {
		return root.innerHTML || fragment;
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
				() => t(context.root, ">link:"),
				url =>
					`<h1 class="header__title"><a class="header__main-url" href="${url}">${t(
						context.root,
						">title:"
					) || "Untitled"}</a></h1>`,
				() =>
					`<h1 class="header__title">${t(context.root, ">title:") ||
						"Untitled"}</h1>`
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
						item => `
					<article class="item items__item">
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
									() => t(item, ">pubDate:") || t(item, ">published:"),
									date =>
										`<time class="item__pubDate" datetime="${date}">${date}</time>`
								)}
								${vif(
									() => t(item, ">author:") || t(item, ">creator:"),
									author => `<span class="item__author">by ${author}</span>`
								)}
							</p>
						</header>
						<div class="content item__content">${enableMedia(
							t(item, ">description:") || t(item, ">content:")
						)}</div>
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

async function main() {
	setThemeSwitching();

	const url = decodeURI(window.location.search.substr(5));
	const resp = await fetch(url);
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
