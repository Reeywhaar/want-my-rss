import { Storage } from "./storage.js";

export default class SubscribeButton extends HTMLElement {
	constructor() {
		super();
		const root = this.attachShadow({ mode: "open" });
		this.init(root);
	}
	private async init(root: ShadowRoot) {
		const style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = "/subscribeButton.css";
		root.appendChild(style);

		const subscribeDiv = document.createElement("div");
		subscribeDiv.className = "subscribe";
		root.appendChild(subscribeDiv);

		const titleSpan = document.createElement("span");
		titleSpan.tabIndex = 0;
		titleSpan.textContent = "Subscribe";
		titleSpan.className = "link";
		const handler = async (newTab: boolean) => {
			const currentFeedReader = await Storage.get("currentFeedReader");
			browser.runtime.sendMessage({
				action: "open-tab",
				url: currentFeedReader.link(this.getAttribute("link")!),
				newTab,
			});
		};
		titleSpan.addEventListener("click", (e) => {
			if (e.which !== 1 && e.which !== 2) return;
			e.preventDefault();
			const newTab = e.metaKey || e.which === 2;
			handler(newTab)
		});
		titleSpan.addEventListener("keydown", (e) => {
			if("keyCode" in e && e.keyCode !== 13) return;
			e.preventDefault();
			const newTab = e.metaKey;
			handler(newTab)
		});
		subscribeDiv.appendChild(titleSpan);

		const provDiv = document.createElement("div");
		provDiv.className = "current-provider";
		provDiv.tabIndex = 0;
		provDiv.addEventListener("focus", () => {
			providersDiv.classList.remove("hidden");
		});
		provDiv.addEventListener("blur", () => {
			providersDiv.classList.add("hidden");
		});
		subscribeDiv.appendChild(provDiv);

		const [readers, currentReaderId] = await Promise.all([
			Storage.get("feedReaders"),
			Storage.get("feedReaderID"),
		]);
		const currentReader = readers.find((r) => r.id === currentReaderId)!;

		const providerIcon = document.createElement("img");
		providerIcon.className = "provider-icon";
		providerIcon.title = currentReader.name;
		providerIcon.src = currentReader.favicon;
		provDiv.appendChild(providerIcon);

		const providersDiv = document.createElement("div");
		providersDiv.className = "providers hidden";
		provDiv.appendChild(providersDiv);

		const providers = readers.map((reader) => {
			const el = document.createElement("span");
			const isCurrent = reader.id === currentReaderId;
			el.className = `providers__item ${
				isCurrent ? "providers__item--current" : ""
			}`;
			el.dataset.id = reader.id;

			const span = document.createElement("span");
			span.textContent = reader.name + " ";
			el.appendChild(span);

			const img = document.createElement("img");
			img.className = "provider-icon";
			img.src = reader.favicon;
			el.appendChild(img);

			el.addEventListener("click", (e) => {
				let id = (e.currentTarget as HTMLElement).dataset.id!;
				(async () => {
					let currentProviderID = await Storage.get("feedReaderID");
					if (id === currentProviderID) return;
					await Storage.set("feedReaderID", id);
					const currentProvider = await Storage.get("currentFeedReader");
					provDiv.blur();
					providers.forEach((i) => {
						const action =
							i.dataset.id === currentProvider.id ? "add" : "remove";
						i.classList[action]("providers__item--current");
					});
				})();
			});

			providersDiv.appendChild(el);
			return el;
		});

		Storage.subscribe(async (changes) => {
			if ("feedReaderID" in changes) {
				const current = await Storage.get("currentFeedReader");
				providerIcon.src = current.favicon;
				providerIcon.title = current.name;
			}
		});
	}
}
