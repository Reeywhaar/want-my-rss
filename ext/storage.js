const cache = new Map();

const listeners = [];

function localStorageProperty(propertyName, def) {
	return {
		get() {
			if (cache.has(propertyName)) return cache.get(propertyName);
			const val = localStorage.getItem(propertyName) || def;
			cache.set(val);
			return val;
		},
		set(x) {
			localStorage.setItem(propertyName, x);
			cache.set(propertyName, x);
			for (let fn of listeners) {
				setTimeout(() => {
					fn(propertyName, x);
				}, 0);
			}
		},
		enumerable: true,
	};
}

const store = {};
Object.defineProperties(store, {
	theme: localStorageProperty("theme", "day"),
	sort: localStorageProperty("sort", "none"),
	provider: localStorageProperty("feed-provider", "feedly"),
});

store.subscribe = fn => {
	listeners.push(fn);
};

export default store;
