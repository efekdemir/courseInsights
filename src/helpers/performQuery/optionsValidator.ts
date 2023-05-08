async function optionsValidator(options: any): Promise<boolean> {
	if (typeof options !== "object") {
		return Promise.resolve(false);
	}

	const optionsKeys = Object.keys(options);
	if (optionsKeys.length === 0 || optionsKeys.length > 2) {
		return Promise.resolve(false);
	}

	const optionsKeyNames = ["COLUMNS", "ORDER"];
	for (let key of optionsKeys) {
		if (!optionsKeyNames.includes(key)) {
			return Promise.resolve(false);
		}
	}

	if (optionsKeys.length === 1 && optionsKeyNames[0] !== "COLUMNS") {
		return Promise.resolve(false);
	} else if (optionsKeys.length === 2 && (optionsKeyNames[0] !== "COLUMNS" || optionsKeyNames[1] !== "ORDER")) {
		return Promise.resolve(false);
	}

	const columns = options["COLUMNS"];

	if (!(await columnsValidator(columns))) {
		return Promise.resolve(false);
	}

	if (optionsKeys.length === 2) {
		const order = options["ORDER"];
		if (!(await orderValidator(order, columns))) {
			return Promise.resolve(false);
		}
	}

	return Promise.resolve(true);
}

async function columnsValidator(columns: any) {
	if (!Array.isArray(columns)) {
		return Promise.resolve(false);
	}

	if (columns.length === 0) {
		return Promise.resolve(false);
	}

	for (let key of columns) {
		let keyString = key.split("_");
		let field = keyString[1];
		const validFields = ["uuid", "id", "title", "instructor", "dept", "year", "avg", "pass", "fail", "audit"];

		if (!validFields.includes(field)) {
			return Promise.resolve(false);
		}
	}

	return Promise.resolve(true);
}

async function orderValidator(order: any, columns: any) {
	if (Array.isArray(order)) {
		return Promise.resolve(false);
	}

	let keyString = order.split("_");
	let field = keyString[1];
	// const validFields = ["uuid", "id", "title", "instructor", "dept", "year", "avg", "pass", "fail", "audit"];

	let validFields = [];
	for (let key of columns) {
		let columnsKeyString = key.split("_");
		let columnsField = columnsKeyString[1];
		validFields.push(columnsField);
	}
	// console.log(validFields);

	if (!validFields.includes(field)) {
		return Promise.resolve(false);
	}

	return Promise.resolve(true);
}

export {optionsValidator};
