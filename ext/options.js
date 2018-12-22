function getFeedItem() {
	const container = document.createElement("div");
	const feedNameInput = document.createElement("input");
	feedNameInput.type = "text";
	container.appendChild(feedNameInput);

	const feedURLInput = document.createElement("input");
	feedURLInput.type = "text";
	container.appendChild(feedURLInput);
}

async function main() {}

main().catch(e => {
	console.error(e);
});
