import { Return as PageReturn, Data as PageData } from "./pageReturnType.js";

function setAction(tabId: number, data: PageData[]) {
	if (data.length > 0) {
		browser.pageAction.setPopup({
			tabId,
			popup: `./popup.html?links=${decodeURIComponent(JSON.stringify(data))}`,
		});
		browser.pageAction.show(tabId);
	} else {
		browser.pageAction.hide(tabId);
	}
}

browser.tabs
	.query({
		active: true,
	})
	.then(tabs => {
		for (const tab of tabs) {
			browser.tabs
				.executeScript(tab.id, {
					file: "./js/page.js",
				})
				.then((x: object[]) => {
					setAction(tab.id!, (x[0] as PageReturn).data);
				})
				.catch(() => {
					setAction(tab.id!, []);
				});
		}
	});

const handler = async (id: number) => {
	browser.pageAction.hide(id);
	(browser.tabs as any)
		.executeScript({
			file: "./js/page.js",
			runAt: "document_end",
		})
		.then((x: object[]) => {
			setAction(id, (x[0] as PageReturn).data);
		})
		.catch(() => {
			setAction(id, []);
		});
};

browser.tabs.onActivated.addListener(info => handler(info.tabId));
browser.tabs.onUpdated.addListener(id => handler(id));

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
