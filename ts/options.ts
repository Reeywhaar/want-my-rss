import { randomInt } from "./utils.js";
import { Storage, StorageFeedReader } from "./storage.js";

/**
 * generates id for new feed
 */
function randomID(): string {
	return btoa(randomInt(100000000000, 999999999999).toString());
}

function TextInput({
	value = "",
	className = "",
}: { value?: string; className?: string } = {}): HTMLInputElement {
	const el = document.createElement("input");
	el.className = "text-input " + className;
	el.type = "text";
	el.value = value;
	if (className) el.className = className;
	return el;
}

type ImagePlaceholderElement = HTMLElement & {
	setURL: (url: string) => void;
};

function ImagePlaceholder({
	url = "",
	className = "",
}: { url?: string; className?: string } = {}): ImagePlaceholderElement {
	const el = (document.createElement(
		"div"
	) as unknown) as ImagePlaceholderElement;
	el.className = "image-placeholder " + className;
	const img = document.createElement("img");
	img.className = "image-placeholder__img";
	img.src = url;
	el.appendChild(img);
	el.setURL = url => {
		img.src = url || "./providers-icons/noname.svg";
	};
	return el;
}

type FeedItemElement = HTMLElement & {
	toData: () => StorageFeedReader;
	clear: () => void;
};

function FeedItem({
	id = "",
	url = "",
	name = "",
	img = "",
	onRemove = null,
	className = "",
}: {
	id?: string;
	url?: string;
	name?: string;
	img?: string;
	onRemove?: ((e: Event, el: HTMLElement) => void) | null;
	className?: string;
} = {}): FeedItemElement {
	const el = (document.createElement("div") as unknown) as FeedItemElement;
	el.className = "feed-item " + className;

	const e_id = document.createElement("input");
	e_id.type = "hidden";
	e_id.value = id;
	el.appendChild(e_id);

	const e_name = TextInput({ value: name, className: "feed-item__name" });
	e_name.placeholder = "Name";
	el.appendChild(e_name);

	const e_url = TextInput({ value: url, className: "feed-item__url" });
	e_url.placeholder = "URL (https://examplereader.com/?sub=%s)";
	el.appendChild(e_url);

	const e_imgurl = TextInput({ value: img, className: "feed-item__imgurl" });
	e_imgurl.placeholder = "Favicon URL (https://examplereader.com/favicon.ico)";
	el.appendChild(e_imgurl);

	const e_img = ImagePlaceholder({
		url: img || "./providers-icons/noname.svg",
		className: "feed-item__img",
	});
	el.appendChild(e_img);

	e_imgurl.addEventListener("input", e => {
		e_img.setURL(
			(e.target as HTMLInputElement).value || "./providers-icons/noname.svg"
		);
	});

	if (onRemove) {
		const e_remove = document.createElement("button");
		e_remove.className = "feed-item__remove-button";
		e_remove.textContent = "remove";
		e_remove.addEventListener("click", e => {
			if (e.target !== (e as any).explicitOriginalTarget) return;
			onRemove.bind(e_remove)(e, el);
		});
		el.appendChild(e_remove);
	}

	el.toData = () => {
		return {
			id: e_id.value,
			name: e_name.value,
			url: e_url.value,
			img: e_imgurl.value,
		};
	};

	el.clear = () => {
		e_name.value = "";
		e_url.value = "";
		e_imgurl.value = "";
		e_img.setURL("");
	};

	return el;
}

type FeedFormElement = HTMLFormElement & {
	setNotice: (notice: string) => void;
	setItems: (items: StorageFeedReader[]) => void;
	reset: () => void;
};

function FeedForm({
	items = [],
	onSave = null,
}: {
	items?: StorageFeedReader[];
	onSave?: ((items: StorageFeedReader[]) => void) | null;
} = {}): FeedFormElement {
	const form = document.createElement("form") as FeedFormElement;
	form.className = "feeds-form";

	const header = document.createElement("h1");
	header.textContent = "Custom Feeds";
	form.appendChild(header);

	const description = document.createElement("p");
	description.textContent = "%s will be interpolated into feed url";
	description.className = "feeds-form__description";
	form.appendChild(description);

	const items_container = document.createElement("div");
	form.appendChild(items_container);

	let e_items: FeedItemElement[] = [];

	form.setItems = items => {
		e_items.forEach(x => x.remove());
		e_items = items.map(x =>
			FeedItem({
				id: x.id,
				url: x.url,
				name: x.name,
				img: x.img,
				onRemove: (_, el) => {
					el.remove();
				},
				className: "feeds-form__item feeds-form__store-item",
			})
		);
		e_items.forEach(x => items_container.appendChild(x));
	};

	form.setItems(items);

	const e_new = FeedItem({
		className: "feeds-form__item feeds-form__new-item",
	});
	form.appendChild(e_new);

	const e_footer = document.createElement("div");
	e_footer.className = "feeds-form__footer";
	form.appendChild(e_footer);

	const e_notice = document.createElement("div");
	e_footer.appendChild(e_notice);

	e_footer.appendChild(document.createElement("div"));

	const e_submit = document.createElement("input");
	e_submit.type = "submit";
	e_submit.value = "save";
	e_footer.appendChild(e_submit);

	let noticeCounter = 0;
	form.setNotice = e => {
		e_notice.textContent = e;
		++noticeCounter;
		setTimeout(() => {
			--noticeCounter;
			if (noticeCounter === 0) {
				e_notice.textContent = "";
			}
		}, 3000);
	};

	form.addEventListener("submit", e => {
		e.preventDefault();
		const newItem = e_new.toData();
		if (newItem.name || newItem.url) {
			if (!newItem.name) {
				form.setNotice("Name required");
				return;
			}
			if (!newItem.url) {
				form.setNotice("URL required");
				return;
			}
		}
		let data: StorageFeedReader[];
		try {
			data = (Array.from(
				form.querySelectorAll(".feeds-form__store-item")
			) as FeedItemElement[]).map(x => {
				const data = x.toData();
				if (!data.name) throw new Error("Name required");
				if (!data.url) throw new Error("URL required");
				return data;
			});
		} catch (e) {
			form.setNotice(e.message);
			return;
		}
		if (newItem.name || newItem.url) {
			const newID = (() => {
				let id = randomID();
				const ids = data.map(x => x.id);
				while (ids.indexOf(id) !== -1) {
					id = randomID();
				}
				return id;
			})();
			newItem.id = newID;
			data.push(newItem);
		}
		onSave && onSave(data);
	});

	form.reset = () => {
		e_new.clear();
	};

	return form;
}

function AdditionalControls({ className = "" }: { className?: string } = {}) {
	const root = document.createElement("div");
	root.className = "options " + className;

	const header = document.createElement("h1");
	header.textContent = "Additional Options";
	root.appendChild(header);

	const resetButton = document.createElement("button");
	resetButton.textContent = "Reset";
	resetButton.title = "Reset all options, and removes all custom feed readers";
	resetButton.addEventListener("click", () => {
		if (!confirm("Are you sure you want to reset")) return;
		Storage.clear();
		location.reload();
	});
	root.appendChild(resetButton);

	return root;
}

async function main() {
	const feeds = await Storage.get("customFeedReaders");
	const form = FeedForm({
		items: feeds,
		onSave: items => {
			Storage.set("customFeedReaders", items);
			form.setItems(items);
			form.setNotice("Saved!");
			form.reset();
		},
	});
	document.body.appendChild(form);
	document.body.appendChild(AdditionalControls());
}

main().catch(e => {
	console.error(e);
});
