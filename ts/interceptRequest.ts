import { Storage } from "./storage.js";

type Handler = (
	message: { action: "open-tab"; newTab: boolean; url: string }
) => void;

(browser.runtime.onMessage.addListener as (handler: Handler) => void)(
	message => {
		switch (message.action) {
			case "open-tab":
				if (message.newTab && message.newTab === true) {
					browser.tabs.create({ url: message.url });
				} else {
					(browser.tabs as any).update({ url: message.url });
				}
				break;
		}
	}
);

const obviousRssTypes = ["application/rss+xml", "application/atom+xml"];

const xmlTypes = [...obviousRssTypes, "application/xml", "text/xml"];

function getRedirectURL(url: string): string {
	return browser.runtime.getURL("./show.html?url=" + encodeURI(url));
}

function getRedirectObject(url: string): browser.webRequest.BlockingResponse {
	return {
		redirectUrl: getRedirectURL(url),
	};
}

/**
 * Finds if request body matches atom os rss spec
 *
 * @param body partial request body content
 */
function isFeed(body: string): boolean {
	if (body.indexOf("<feed") !== -1) return true;
	if (body.indexOf("<rss") !== -1) return true;
	return false;
}

type RequestData = {
	requestId: string;
	url: string;
	method: string;
	frameId: number;
	parentFrameId: number;
	tabId: number;
	type: browser.webRequest.ResourceType;
	timeStamp: number;
	originUrl: string;
	statusLine: string;
	responseHeaders?: browser.webRequest.HttpHeaders;
	statusCode: number;
};

function webRequestHandler(
	data: RequestData
): browser.webRequest.BlockingResponse | undefined {
	if (
		data.originUrl &&
		data.originUrl.indexOf(browser.runtime.getURL("")) !== -1
	)
		return;
	const contentTypeHeader = data.responseHeaders!.find(
		x => x.name.toLocaleLowerCase() === "content-type"
	);
	if (!contentTypeHeader) return;
	const type = contentTypeHeader.value;
	if (!type) return;
	const lctype = type.toLocaleLowerCase();
	let xmlType = null;
	for (let type of xmlTypes) {
		if (lctype.indexOf(type) !== -1) {
			xmlType = type;
			break;
		}
	}
	if (!xmlType) return;
	if (obviousRssTypes.indexOf(xmlType) !== -1)
		return getRedirectObject(data.url);

	const filter = browser.webRequest.filterResponseData(data.requestId);
	const decoder = new TextDecoder();
	let reqbody = "";
	filter.ondata = event => {
		reqbody += decoder.decode(event.data);
		filter.write(event.data);
		if (reqbody.length > 100) {
			if (isFeed(reqbody)) {
				browser.tabs.update(data.tabId, {
					url: getRedirectURL(data.url),
					loadReplace: true,
				});
				filter.suspend();
				return;
			}
			filter.disconnect();
			return;
		}
	};
	filter.onstop = () => {
		filter.disconnect();
	};
	filter.onerror = () => {
		filter.disconnect();
	};
	return;
}

const RequestInterceptor: {
	state: boolean;
	on: () => void;
	off: () => void;
} = {
	state: false,
	on: () => {
		if (RequestInterceptor.state) return;
		browser.webRequest.onHeadersReceived.addListener(
			webRequestHandler,
			{
				types: ["main_frame"],
				urls: ["<all_urls>"],
			},
			["blocking", "responseHeaders"]
		);
		RequestInterceptor.state = true;
	},
	off: () => {
		if (!RequestInterceptor.state) return;
		browser.webRequest.onHeadersReceived.removeListener(webRequestHandler);
		RequestInterceptor.state = false;
	},
};

/**
 * Sets request interception so click on feed link
 * redirects to extension's show page
 */
export async function attach() {
	const redirectRequests = await Storage.get("redirectRequests");
	if (redirectRequests) RequestInterceptor.on();

	Storage.subscribe(changes => {
		if ("redirectRequests" in changes) {
			changes.redirectRequests!.newValue
				? RequestInterceptor.on()
				: RequestInterceptor.off();
		}
	});
}
