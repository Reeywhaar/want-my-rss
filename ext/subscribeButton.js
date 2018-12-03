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
			<style>
				:host {
					font-size: initial;
					font-weight: initial;
					color: initial;
					position: relative;
				}

				.subscribe {
					display:inline-block;
				}

				.link {
					display: inline-block;
					padding: .2rem .4rem;
					background: #fff;
					border: 1px solid rgba(0, 0, 0, 0.2);
					cursor: default;
					border-top-left-radius: 0.2em;
					border-bottom-left-radius: 0.2em;
					border-right: none;
				}

				.link:hover {
					background-color: hsla(210, 70%, 50%, 0.3);
				}

				.current-provider {
					display: inline;
					padding: 0.2rem 0.4rem 0.2rem 0.4rem;
					background: #fff;
					border: 1px solid rgba(0, 0, 0, 0.2);
					cursor: default;
					border-top-right-radius: 0.2em;
					border-bottom-right-radius: 0.2em;
				}

				.current-provider:hover, .current-provider:focus {
					background-color: hsla(210, 70%, 50%, 0.3);
				}

				.current-provider:focus {
					outline: none;
				}

				.provider-icon {
					width: 1em;
					height: 1em;
					vertical-align: -0.17em;
				}

				.providers {
					position:absolute;
					top: 1.5rem;
					right: 0;
					background: #fff;
					border-radius: 0.2em;
					border: 1px solid rgba(0, 0, 0, 0.2);
					z-index: 2;
				}

				.providers__item {
					display:block;
					cursor: default;
					padding: 0.2em 0.4em;
					white-space: nowrap;
					text-align: right;
				}

				.providers__item:not(.providers__item--current):hover {
					background-color: hsla(210, 70%, 50%, 0.3);
				}

				.providers__item--current {
					background-color: hsla(210, 70%, 50%, 0.1);
				}

				.providers__item + .providers__item {
					border-top: 1px solid rgba(0, 0, 0, 0.2);
				}

				.hidden {
					display: none;
				}
			</style>
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
