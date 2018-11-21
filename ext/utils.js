/**
 * takes predicate and if it is not falsy then pass it
 * as first argument to fn, if falsy then fnNot will be
 * called with no arguments
 *
 * used as rendering helper
 */
export function vif(predicate, fn, fnNot = () => "") {
	let l;
	try {
		l = predicate();
	} catch (e) {}
	if (l) {
		return fn(l);
	}
	return fnNot();
}

/**
 * mappers for query params for "t" function
 */
const accessMappers = {
	">": (el, prop) => el.querySelector(":scope " + prop),
	"^": (el, prop) => el.getAttribute(prop),
	":": el => el.textContent.trim(),
	"%": el => el.innerHTML.trim(),
	".": (el, prop) => el[prop],
};

/**
 * t stands for "trace"
 *
 * t is a traversal tool for xml type documents
 *
 * @param {any} el
 * @param {String} query
 */
export function t(el, query, def = "") {
	try {
		let action;
		let current;
		let isEscape = false;
		for (let char of query) {
			if (char === "\\") {
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
		return def;
	}
}

export function longest(...strings) {
	let longest = strings[0];
	for (let i = 1; i < strings.length; i++) {
		if (strings[i].length > longest) longest = strings[i];
	}
	return longest;
}

export function setProp(obj, prop) {
	return val => (obj[prop] = val);
}
