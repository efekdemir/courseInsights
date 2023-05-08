import {whereValidator} from "./whereValidator";
import {optionsValidator} from "./optionsValidator";

const queryValidatorAsync = async (potentialQuery: unknown) => {
	let query: any;
	if (typeof potentialQuery === "object") {
		try {
			if (potentialQuery !== null) {
				query = potentialQuery;
			} else if (typeof potentialQuery === "string") {
				query = await JSON.parse(potentialQuery);
			}
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
		} catch (error) {
			// console.log("got here 1");
			return false;
		}
	} else {
		// console.log("hello");
		return false;
	}

	let queryKeys = Object.keys(query);
	const requiredQueryBodyKeys = ["WHERE", "OPTIONS"];
	// console.log("got here 2");

	if (!(await checkQueryValidity(query, queryKeys, requiredQueryBodyKeys))) {
		return false;
	}
	// console.log("got here 3");
	let whereKey: any = query["WHERE"];
	let optionsKey: any = query["OPTIONS"];

	if (!(await whereValidator(whereKey)) || !(await optionsValidator(optionsKey))) {
		return false;
	}
	// console.log("got here 4");

	return true;
};

async function checkQueryValidity(query: any, queryKeys: string[], requiredQueryBodyKeys: string[]): Promise<boolean> {
	if (queryKeys[0] !== requiredQueryBodyKeys[0]) {
		return Promise.resolve(false);
	}

	if (queryKeys[1] !== requiredQueryBodyKeys[1]) {
		return Promise.resolve(false);
	}

	if (queryKeys.length !== 2) {
		return Promise.resolve(false);
	}

	return Promise.resolve(true);
}

export {queryValidatorAsync};
