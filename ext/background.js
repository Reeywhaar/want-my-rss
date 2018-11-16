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
	browser.tabs
		.executeScript({
			file: "./page.js",
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
			browser.tabs.create({ url: message.url });
			break;
	}
});
