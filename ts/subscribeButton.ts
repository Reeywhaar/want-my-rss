import { Storage } from "./storage.js";

export default class SubscribeButton extends HTMLElement {
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		this.init(root);
	}
	async init(root: ShadowRoot) {
		const FeedReaders = await Storage.get("feedReaders");
		const currentReaderID = await Storage.get("feedReaderID");
		const currentReader = FeedReaders.find(x => x.id === currentReaderID)!;
		root.innerHTML = `
			<link rel="stylesheet" href="/subscribeButton.css">
			<div class="subscribe">
				<span class="link">Subscribe</span><!--
				--><div class="current-provider" tabindex="0"><!--
					--><img class="provider-icon" title=${currentReader.name} src="${
			currentReader.favicon
		}"/>
					<div class="providers hidden">
						${FeedReaders.map(
							p =>
								`<span data-id="${p.id}" class="providers__item ${
									p.id === currentReader.id ? "providers__item--current" : ""
								}">${p.name} <img class="provider-icon" src="${
									p.favicon
								}"/></span>`
						).join("")}
					</div>
				</div>
			</div>
		`;

		const elements: {
			button: HTMLButtonElement;
			icon: HTMLImageElement;
			outlet: HTMLDivElement;
			popup: HTMLDivElement;
			providers: NodeListOf<HTMLDivElement>;
		} = {
			button: root.querySelector(".link") as HTMLButtonElement,
			icon: root.querySelector(".provider-icon") as HTMLImageElement,
			outlet: root.querySelector(".current-provider") as HTMLDivElement,
			popup: root.querySelector(".providers") as HTMLDivElement,
			providers: root.querySelectorAll(".providers__item") as NodeListOf<
				HTMLDivElement
			>,
		};

		Storage.subscribe(async changes => {
			if ("feedReaderID" in changes) {
				const current = await Storage.get("currentFeedReader");
				elements.icon.src = current.favicon;
				elements.icon.title = current.name;
			}
		});

		elements.button.addEventListener("mouseup", e => {
			e.preventDefault();
			const newTab = e.metaKey || e.which === 2;
			(async () => {
				const currentFeedReader = await Storage.get("currentFeedReader");
				browser.runtime.sendMessage({
					action: "open-tab",
					url: currentFeedReader.link(this.getAttribute("link")!),
					newTab,
				});
			})();
		});

		elements.outlet.addEventListener("focus", () => {
			elements.popup.classList.remove("hidden");
		});

		elements.outlet.addEventListener("blur", () => {
			elements.popup.classList.add("hidden");
		});

		elements.providers.forEach(i => {
			i.addEventListener("click", e => {
				let id = (e.currentTarget as HTMLElement).dataset.id!;
				(async () => {
					let currentProviderID = await Storage.get("feedReaderID");
					if (id === currentProviderID) return;
					await Storage.set("feedReaderID", id);
					const currentProvider = await Storage.get("currentFeedReader");
					elements.outlet.blur();
					elements.providers.forEach(i => {
						const action =
							i.dataset.id === currentProvider.id ? "add" : "remove";
						i.classList[action]("providers__item--current");
					});
				})();
			});
		});
	}
}
