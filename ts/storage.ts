import { Sorting } from "./sortings.js";
import { FeedReader, FeedReaders } from "./feedReaders.js";
import { ThemeLabelType } from "./themeType.js";

const internalStorage = browser.storage.sync;

/**
 * FeedReader storage outline
 */
export type StorageFeedReader = {
	id: string;
	name: string;
	url: string;
	img: string;
};

type RawStorageProperties = {
	theme: ThemeLabelType;
	sort: Sorting;
	feedReaderID: string;
	useRelativeTime: boolean;
	customFeedReaders: StorageFeedReader[];
	redirectRequests: boolean;
};

type RawStorageChange = {
	[P in keyof RawStorageProperties]: {
		oldValue: RawStorageProperties[P];
		newValue: RawStorageProperties[P];
	}
};

const storageDefaults: RawStorageProperties = {
	theme: "day",
	sort: "none",
	feedReaderID: FeedReaders[0].id,
	useRelativeTime: true,
	customFeedReaders: [],
	redirectRequests: true,
};

/**
 * Raw storage wrapper around browser.storage.sync
 */
export class RawStorage {
	static async get<T extends keyof RawStorageProperties>(
		label: T
	): Promise<RawStorageProperties[T]> {
		const val = (await internalStorage.get(label))[
			label
		] as StorageProperties[T];
		if (typeof val === "undefined") return storageDefaults[label];
		return val;
	}

	static async getAll(): Promise<RawStorageProperties> {
		const data = ((await internalStorage.get()) as unknown) as RawStorageProperties;
		for (let key of Object.keys(storageDefaults)) {
			if (!data.hasOwnProperty(key))
				(data as any)[key] = (storageDefaults as any)[key];
		}
		return data;
	}

	static async set<T extends keyof RawStorageProperties>(
		label: T,
		value: RawStorageProperties[T]
	): Promise<void> {
		await internalStorage.set({
			[label]: value,
		});
	}

	static subscribe(
		handler: (changes: Partial<RawStorageChange>) => void
	): void {
		const fn = (
			changes: Partial<RawStorageChange>,
			area: browser.storage.StorageName
		) => {
			if (area !== "sync") return;
			/**
			 * filtered changes
			 */
			let fChanges = {} as Partial<RawStorageChange>;
			for (let key of Object.keys(changes)) {
				if ((changes as any)[key].oldValue !== (changes as any)[key].newValue) {
					(fChanges as any)[key] = (changes as any)[key];
					if (!("newValue" in (fChanges as any)[key]))
						(fChanges as any)[key].newValue = (storageDefaults as any)[key];
				}
			}
			handler(fChanges);
		};
		browser.storage.onChanged.addListener(fn);
	}

	static clear(): Promise<void> {
		return internalStorage.clear();
	}
}

function mergeReaders(readers: StorageFeedReader[]): FeedReader[] {
	const custom = readers.map(r => {
		return {
			id: r.id,
			name: r.name,
			link: (feed: string) => r.url.replace("%s", encodeURI(feed)),
			favicon: r.img || "./providers-icons/noname.svg",
		};
	});
	const predefined = FeedReaders.map(r => {
		const clone = { ...r };
		clone.favicon = `./providers-icons/${r.favicon}`;
		return clone;
	});
	return [...predefined, ...custom];
}

/**
 * Computed properties of Storage
 */
type StorageProperties = RawStorageProperties & {
	feedReaders: FeedReader[];
	currentFeedReader: FeedReader;
};

/**
 * Contains rawstorage with computed properties
 */
export class Storage extends RawStorage {
	static async get<T extends keyof StorageProperties>(
		label: T
	): Promise<StorageProperties[T]> {
		if (label === "feedReaders")
			return mergeReaders(await super.get("customFeedReaders"));
		if (label === "currentFeedReader") {
			const readers = await this.get("feedReaders");
			const id = await this.get("feedReaderID");
			return readers.find(x => x.id === id)!;
		}
		return RawStorage.get(label as keyof RawStorageProperties);
	}

	static async getAll(): Promise<StorageProperties> {
		const data = (await super.getAll()) as StorageProperties;
		data.feedReaders = mergeReaders(data.customFeedReaders);
		return data;
	}
}
