async function whereValidator(where: any): Promise<boolean> {
	if (Array.isArray(where) || typeof where === "string") {
		return Promise.resolve(false);
	}

	if (typeof where !== "object") {
		return Promise.resolve(false);
	}
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	let whereKeys = Object.keys(where);
	if (whereKeys.length === 0) {
		return Promise.resolve(true);
	}

	if (whereKeys.length > 1) {
		return Promise.resolve(false);
	}

	return await filterValidator(where);
}

async function filterValidator(filter: any): Promise<boolean> {
	let filterKeys = Object.keys(filter);
	if (filterKeys.length === 0) {
		return Promise.resolve(false);
	}

	let key = filterKeys[0];
	switch (key) {
		case "IS":
			return await isValidator(filter);
		case "NOT":
			return await notValidator(filter);
		case "AND":
			return await andOrValidator(filter);
		case "OR":
			return await andOrValidator(filter);
		case "LT":
			return await greaterLesserEqualValidator(filter);
		case "GT":
			return await greaterLesserEqualValidator(filter);
		case "EQ":
			return await greaterLesserEqualValidator(filter);
		default:
			return Promise.resolve(false);
	}
}

async function isValidator(filter: any): Promise<boolean> {
	let is = filter["IS"];

	if (typeof is !== "object") {
		return Promise.resolve(false);
	}

	let sKeys = Object.keys(is);
	if (sKeys.length !== 1) {
		return Promise.resolve(false);
	}

	let sKey = sKeys[0];
	let sField = sKey.split("_")[1];

	const allowedFields = ["dept", "id", "instructor", "title", "uuid"];
	if (!allowedFields.includes(sField)) {
		return Promise.resolve(false);
	}

	let inputString = is[sKey];
	if (typeof inputString !== "string") {
		return Promise.resolve(false);
	}
	// if (inputString.split("*").length - 1 > 2 || inputString.includes("**") && (inputString.length > 2)) {
	// 	return Promise.resolve(false);
	// }

	// https://stackoverflow.com/questions/55094140/matching-string-that-contains-asterisk
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
	let validInputString = new RegExp("^\\*?[^*]*\\*?$").test(inputString);
	if (!validInputString) {
		return Promise.resolve(false);
	}

	return Promise.resolve(true);
}

async function notValidator(filter: any): Promise<boolean> {
	let not = filter["NOT"];
	let notKeys = Object.keys(not);
	if (typeof not !== "object") {
		return Promise.resolve(false);
	}

	if (notKeys.length !== 1) {
		return Promise.resolve(false);
	}

	return await filterValidator(not);
}

// async function andValidator(filter: any): Promise<boolean> {
// 	const and = filter["AND"];
// 	if (!Array.isArray(and)) {
// 		return Promise.resolve(false);
// 	}
//
// 	if (and.length === 0) {
// 		return Promise.resolve(false);
// 	}
// // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
// 	for await (let a of and) {
// 		if (!await filterValidator(a)) {
// 			return Promise.resolve(false);
// 		}
// 	}
// 	return Promise.resolve(true);
// }
//
// async function orValidator(filter: any): Promise<boolean> {
// 	let or = filter["OR"];
//
// 	if (!Array.isArray(or) || or.length === 0) {
// 		return Promise.resolve(false);
// 	}
//
// 	for await (let o of or) {
// 		if (!await filterValidator(o)) {
// 			return Promise.resolve(false);
// 		}
// 	}
// 	return Promise.resolve(true);
// }

// combining and or validators below
async function andOrValidator(filter: any): Promise<boolean> {
	const allowedLogic = ["AND", "OR"];
	let logicKey = Object.keys(filter)[0];
	// console.log(logicKey);
	let logic = filter[logicKey];

	if (!allowedLogic.includes(logicKey)) {
		return Promise.resolve(false);
	}
	if (!Array.isArray(logic) || logic.length === 0) {
		return Promise.resolve(false);
	}

	for await (let l of logic) {
		if (!(await filterValidator(l))) {
			return Promise.resolve(false);
		}
	}
	return Promise.resolve(true);
}

async function greaterLesserEqualValidator(filter: any): Promise<boolean> {
	const allowedMcomparators = ["LT", "GT", "EQ"];
	let mcomparatorKey = Object.keys(filter)[0];
	let mcomparator = filter[mcomparatorKey];

	if (!allowedMcomparators.includes(mcomparatorKey)) {
		return Promise.resolve(false);
	}

	if (typeof mcomparator !== "object") {
		return Promise.resolve(false);
	}

	let mKeys = Object.keys(mcomparator);
	if (mKeys.length !== 1) {
		return Promise.resolve(false);
	}

	let mKey = mKeys[0];
	let mKeyMField = mKey.split("_")[1];

	const allowedSFields = ["avg", "pass", "fail", "audit", "year"];

	if (!allowedSFields.includes(mKeyMField)) {
		return Promise.resolve(false);
	}

	let inputNum = mcomparator[mKey];
	if (typeof inputNum !== "number") {
		return Promise.resolve(false);
	}

	return Promise.resolve(true);
}

// tried to combine these 3 functions above
// async function ltValidator(filter: any): Promise<boolean> {
// 	let lt = filter["LT"];
//
// 	if (typeof lt !== "object") {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKeys = Object.keys(lt);
// 	if (mKeys.length !== 1) {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKey = mKeys[0];
// 	let mKeyMField = mKey.split("_")[1];
//
// 	const allowedSFields = ["avg", "pass", "fail", "audit", "year"];
//
// 	if (!allowedSFields.includes(mKeyMField)) {
// 		return Promise.resolve(false);
// 	}
//
// 	let inputNum = lt[mKey];
// 	if (typeof inputNum !== "number") {
// 		return Promise.resolve(false);
// 	}
//
// 	return Promise.resolve(true);
// }
//
// async function gtValidator(filter: any): Promise<boolean> {
// 	let gt = filter["LT"];
//
// 	if (typeof gt !== "object") {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKeys = Object.keys(gt);
// 	if (1 !== mKeys.length) {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKey = mKeys[0];
// 	let mKeyMField = mKey.split("_")[1];
//
// 	const allowedSFields = ["avg", "pass", "fail", "audit", "year"];
//
// 	if (!allowedSFields.includes(mKeyMField)) {
// 		return Promise.resolve(false);
// 	}
//
// 	let inputNum = gt[mKey];
// 	if (typeof inputNum !== "number") {
// 		return Promise.resolve(false);
// 	}
//
// 	return Promise.resolve(true);
// }
//
// async function eqValidator(filter: any): Promise<boolean> {
// 	let eq = filter["LT"];
//
// 	if (typeof eq !== "object") {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKeys = Object.keys(eq);
// 	if (!(mKeys.length === 1)) {
// 		return Promise.resolve(false);
// 	}
//
// 	let mKey = mKeys[0];
// 	let mKeyMField = mKey.split("_")[1];
//
// 	const allowedSFields = ["avg", "pass", "fail", "audit", "year"];
//
// 	if (!allowedSFields.includes(mKeyMField)) {
// 		return Promise.resolve(false);
// 	}
//
// 	let inputNum = eq[mKey];
// 	if (typeof inputNum !== "number") {
// 		return Promise.resolve(false);
// 	}
//
// 	return Promise.resolve(true);
// }

export {whereValidator};
