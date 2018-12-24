import { attach as attachPageActionHandlers } from "./pageActionHandler.js";
import { attach as attachRequestInterception } from "./interceptRequest.js";

async function main() {
	attachPageActionHandlers();
	attachRequestInterception();
}

main().catch(e => {
	console.error(e);
});
