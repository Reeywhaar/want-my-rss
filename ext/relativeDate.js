const now = new Date().getTime();
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

function pluralize(n, label) {
	if (n === 1) {
		switch (label) {
			case "second":
			case "minute":
			case "day":
				return `A ${label}`;
			case "hour":
				return "An hour";
		}
	}
	const nstr = `${n}`;
	if (nstr.endsWith("1") && !nstr.endsWith("11")) return `${nstr} ${label}`;
	return `${nstr} ${label}s`;
}

function relativeDate(dateString) {
	try {
		const timestamp = Date.parse(dateString);
		const time = new Date(timestamp).toLocaleString();
		const delta = now - timestamp;
		if (delta > week) return time;
		if (delta < 30 * second) return "now";
		if (delta < minute)
			return `${pluralize(Math.round(delta / second), "second")} ago`;
		if (delta < hour)
			return `${pluralize(Math.round(delta / minute), "minute")} ago`;
		if (delta < day)
			return `${pluralize(Math.round(delta / hour), "hour")} ago`;
		if (delta <= week)
			return `${pluralize(Math.round(delta / day), "day")} ago`;
		return time;
	} catch (e) {
		return dateString;
	}
}

export default class RelativeDate extends HTMLTimeElement {
	constructor() {
		super();
		this.attributeChangedCallback();
	}
	attributeChangedCallback(name, oldValue, newValue) {
		if (this.dataset.relative === "true") {
			this.textContent = relativeDate(this.dateTime);
		} else {
			this.textContent = new Date(this.dateTime).toLocaleString();
		}
	}
}
