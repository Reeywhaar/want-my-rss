import store from "./storage.js";
import { CustomProviderStoreLabel } from "./constants.js";

const Providers = [
	{
		id: "feedly",
		name: "Feedly",
		link: feed => `https://feedly.com/i/subscription/feed/${encodeURI(feed)}`,
		favicon: "feedly.svg",
	},
	{
		id: "theoldreader",
		name: "The Old Reader",
		link: feed =>
			`https://theoldreader.com/feeds/subscribe?url=${encodeURI(feed)}`,
		favicon: "theoldreader.png",
	},
	{
		id: "inoreader",
		name: "Inoreader",
		link: feed => `http://www.inoreader.com/feed/${encodeURI(feed)}`,
		favicon: "inoreader.ico",
	},
	{
		id: "newsblur",
		name: "News Blur",
		link: feed => `http://www.newsblur.com/?url=${encodeURI(feed)}`,
		favicon: "newsblur.png",
	},
	{
		id: "netvibes",
		name: "Netvibes",
		link: feed =>
			`https://www.netvibes.com/subscribe.php?url=${encodeURI(feed)}`,
		favicon: "netvibes.png",
	},
	{
		id: "bazqux",
		name: "BazQux",
		link: feed => `https://bazqux.com/add?url=${encodeURI(feed)}`,
		favicon: "bazqux.ico",
	},
	{
		id: "feedbin",
		name: "Feedbin",
		link: feed => `https://feedbin.me/?subscribe=${encodeURI(feed)}`,
		favicon: "feedbin.ico",
	},
	{
		id: "g2reader",
		name: "G2Reader",
		link: feed => `https://g2reader.com/?add&q=${encodeURI(feed)}`,
		favicon: "g2reader.ico",
	},
];

/**
 * returns all providers: predefined, and those in browser storage
 */
async function getMergedProviders() {
	const stored = (
		(await browser.storage.sync.get(CustomProviderStoreLabel))[
			CustomProviderStoreLabel
		] || []
	).map(r => {
		return {
			id: r.id,
			name: r.name,
			link: feed => r.url.replace("%s", encodeURI(feed)),
			favicon: r.img || "./providers-icons/noname.svg",
		};
	});
	const result = [
		...Providers.map(r => {
			const clone = { ...r };
			clone.favicon = `./providers-icons/${r.favicon}`;
			return clone;
		}),
		...stored,
	];
	result.get = () => {
		return result.find(p => p.id === store.provider) || Providers[0];
	};

	result.set = id => {
		store.provider = id;
	};

	return result;
}

export default class SubscribeButton extends HTMLElement {
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		this.init(root);
	}
	async init(root) {
		const Providers = await getMergedProviders();
		const currentProvider = Providers.get();
		root.innerHTML = `
			<link rel="stylesheet" href="/subscribeButton.css">
			<div class="subscribe">
				<span class="link">Subscribe</span><!--
				--><div class="current-provider" tabindex="0"><!--
					--><img class="provider-icon" title=${currentProvider.name} src="${
			currentProvider.favicon
		}"/>
					<div class="providers hidden">
						${Providers.map(
							p =>
								`<span data-id="${p.id}" class="providers__item ${
									p.id === currentProvider.id ? "providers__item--current" : ""
								}">${p.name} <img class="provider-icon" src="${
									p.favicon
								}"/></span>`
						).join("")}
					</div>
				</div>
			</div>
		`;

		const elements = {
			button: root.querySelector(".link"),
			icon: root.querySelector(".provider-icon"),
			outlet: root.querySelector(".current-provider"),
			popup: root.querySelector(".providers"),
			providers: root.querySelectorAll(".providers__item"),
		};

		store.subscribe(prop => {
			if (prop === "feed-provider") {
				const p = Providers.get();
				elements.icon.src = p.favicon;
				elements.icon.title = p.name;
			}
		});

		elements.button.addEventListener("mouseup", e => {
			e.preventDefault();
			const provider = Providers.get();
			browser.runtime.sendMessage({
				action: "open-tab",
				url: provider.link(this.getAttribute("link")),
				newTab: e.metaKey || e.which === 2,
			});
		});

		elements.outlet.addEventListener("focus", e => {
			elements.popup.classList.remove("hidden");
		});

		elements.outlet.addEventListener("blur", e => {
			elements.popup.classList.add("hidden");
		});

		elements.providers.forEach(i => {
			i.addEventListener("click", e => {
				let currentProvider = Providers.get();
				if (e.currentTarget.dataset.id === currentProvider.id) return;
				Providers.set(e.currentTarget.dataset.id);
				currentProvider = Providers.get();
				elements.outlet.blur();
				elements.providers.forEach(i => {
					if (i.dataset.id === currentProvider.id) {
						i.classList.add("providers__item--current");
					} else {
						i.classList.remove("providers__item--current");
					}
				});
			});
		});
	}
}
