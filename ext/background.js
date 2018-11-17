function setAction(tabId, data) {
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
					file: "./page.js",
				})
				.then(x => {
					setAction(tab.id, x[0].data);
				})
				.catch(e => {
					setAction(tab.id, []);
				});
		}
	});

const handler = async id => {
	browser.pageAction.hide(id);
	browser.tabs
		.executeScript({
			file: "./page.js",
			runAt: "document_end",
		})
		.then(x => {
			setAction(id, x[0].data);
		})
		.catch(e => {
			setAction(id, []);
		});
};

browser.tabs.onActivated.addListener(info => handler(info.tabId));
browser.tabs.onUpdated.addListener(id => handler(id));

browser.runtime.onMessage.addListener((message, sender, respond) => {
	switch (message.action) {
		case "open-tab":
			if (message.newTab && message.newTab === true) {
				browser.tabs.create({ url: message.url });
			} else {
				browser.tabs.update({ url: message.url });
			}
			break;
	}
});
