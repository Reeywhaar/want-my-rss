import store from "./storage.js";

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
];

class Provider {
	static get() {
		return Providers.find(p => p.id === store.provider) || Providers[0];
	}

	static set(id) {
		store.provider = id;
	}
}

export default class SubscribeButton extends HTMLElement {
	constructor() {
		super();
		const currentProvider = Provider.get();
		const root = this.attachShadow({ mode: "open" });
		root.innerHTML = `
			<link rel="stylesheet" href="/subscribeButton.css">
			<div class="subscribe">
				<span class="link">Subscribe</span><!--
				--><div class="current-provider" tabindex="0"><!--
					--><img class="provider-icon" title=${
						currentProvider.name
					} src="./providers-icons/${currentProvider.favicon}"/>
					<div class="providers hidden">
						${Providers.map(
							p =>
								`<span data-id="${p.id}" class="providers__item ${
									p.id === currentProvider.id ? "providers__item--current" : ""
								}">${
									p.name
								} <img class="provider-icon" src="./providers-icons/${
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
				elements.icon.src = `./providers-icons/${Provider.get().favicon}`;
				elements.icon.title = Provider.get().name;
			}
		});

		elements.button.addEventListener("mouseup", e => {
			e.preventDefault();
			const provider = Provider.get();
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
				let currentProvider = Provider.get();
				if (e.currentTarget.dataset.id === currentProvider.id) return;
				Provider.set(e.currentTarget.dataset.id);
				currentProvider = Provider.get();
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
