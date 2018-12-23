import { randomInt } from "./utils.js";
import { CustomProviderStoreLabel } from "./constants.js";

function randomID() {
	return btoa(randomInt(100000000000, 999999999999).toString());
}

async function getFeeds() {
	const feeds = (await browser.storage.sync.get(CustomProviderStoreLabel))[
		CustomProviderStoreLabel
	];
	return feeds || [];
}

async function setFeeds(readers) {
	await browser.storage.sync.set({ [CustomProviderStoreLabel]: readers });
}

function TextInput({ value = "", className = "" } = {}) {
	const el = document.createElement("input");
	el.className = "text-input " + className;
	el.type = "text";
	el.value = value;
	if (className) el.className = className;
	return el;
}

function ImagePlaceholder({ url = "", className = "" } = {}) {
	const el = document.createElement("div");
	el.className = "image-placeholder " + className;
	const img = document.createElement("img");
	img.className = "image-placeholder__img";
	img.src = url;
	el.appendChild(img);
	el.setURL = url => {
		img.src = url;
	};
	return el;
}

function FeedItem({
	id = "",
	url = "",
	name = "",
	img = "",
	onRemove = null,
	className = "",
} = {}) {
	const el = document.createElement("div");
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
		e_img.setURL(e.target.value || "./providers-icons/noname.svg");
	});

	if (onRemove) {
		const e_remove = document.createElement("button");
		e_remove.className = "feed-item__remove-button";
		e_remove.textContent = "remove";
		e_remove.addEventListener("click", e => {
			if (e.target !== e.explicitOriginalTarget) return;
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
	};

	return el;
}

function FeedForm({ items = [], onSave = null } = {}) {
	const form = document.createElement("form");
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

	let e_items = [];

	form.setItems = items => {
		e_items.forEach(x => x.remove());
		e_items = items.map(x =>
			FeedItem({
				id: x.id,
				url: x.url,
				name: x.name,
				img: x.img,
				onRemove: (e, el) => {
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
		let data;
		try {
			data = Array.from(form.querySelectorAll(".feeds-form__store-item")).map(
				x => {
					const data = x.toData();
					if (!data.name) throw new Error("Name required");
					if (!data.url) throw new Error("URL required");
					return data;
				}
			);
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
		onSave(data);
	});

	form.reset = () => {
		e_new.clear();
	};

	return form;
}

async function main() {
	const feeds = await getFeeds();
	const form = FeedForm({
		items: feeds,
		onSave: items => {
			setFeeds(items);
			form.setItems(items);
			form.setNotice("Saved!");
			form.reset();
		},
	});
	document.body.appendChild(form);
}

main().catch(e => {
	console.error(e);
});
