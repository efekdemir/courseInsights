import {Section} from "../models/SectionModel";
import {InsightError} from "../../controller/IInsightFacade";

async function filterHandler(filter: any, section: Section): Promise<boolean> {
	let filterKeys: any[] = Object.keys(filter);
	try {
		switch (filterKeys[0]) {
			case "IS": {
				let is = filter["IS"];
				return await handleIS(is, section);
			}
			case "NOT": {
				let not = filter["NOT"];
				return await handleNOT(not, section);
			}
			case "AND": {
				let and = filter["AND"];
				return await handleAND(and, section);
			}
			case "OR": {
				let or = filter["OR"];
				return await handleOR(or, section);
			}
			case "GT": {
				let gt = filter["GT"];
				return await handleGT(gt, section);
			}
			case "LT": {
				let lt = filter["LT"];
				return await handleLT(lt, section);
			}
			case "EQ": {
				let eq = filter["EQ"];
				return await handleEQ(eq, section);
			}
			default: {
				return false;
			}
		}
	} catch (error) {
		return Promise.reject(new InsightError("failed to handle"));
	}
}

async function handleNOT(not: any, section: Section): Promise<boolean> {
	try {
		let result = await filterHandler(not, section);
		return Promise.resolve(!result);
	} catch (error) {
		return Promise.reject(new InsightError("failed to handle"));
	}
}

async function handleAND(and: any, section: Section): Promise<boolean> {
	try {
		for await (let i of and) {
			if (!(await filterHandler(i, section))) {
				return Promise.resolve(false);
			}
		}
	} catch (error) {
		return Promise.reject(new InsightError("failed to handle"));
	}
	return Promise.resolve(true);
}

async function handleOR(or: any, section: Section): Promise<boolean> {
	try {
		for await (let i of or) {
			if (await filterHandler(i, section)) {
				return Promise.resolve(true);
			}
		}
	} catch (error) {
		return Promise.reject(new InsightError("failed to handle"));
	}
	return Promise.resolve(false);
}

async function handleGT(gt: any, section: Section): Promise<boolean> {
	let mKeys = Object.keys(gt);
	let mKey = mKeys[0];
	let mKeyArray = mKey.split("_");
	let mField = mKeyArray[1];
	let inputNumber = gt[mKey];

	switch (mField) {
		case "avg":
			return Promise.resolve(section.sections_avg > inputNumber);
		case "pass":
			return Promise.resolve(section.sections_pass > inputNumber);
		case "fail":
			return Promise.resolve(section.sections_fail > inputNumber);
		case "audit":
			return Promise.resolve(section.sections_audit > inputNumber);
		case "year":
			return Promise.resolve(section.sections_year > inputNumber);
		default:
			return Promise.resolve(false);
	}
}

async function handleLT(lt: any, section: Section): Promise<boolean> {
	let mKeys = Object.keys(lt);
	let mKey = mKeys[0];
	let mKeyArray = mKey.split("_");
	let mField = mKeyArray[1];
	let inputNumber = lt[mKey];

	switch (mField) {
		case "avg":
			return Promise.resolve(section.sections_avg < inputNumber);
		case "pass":
			return Promise.resolve(section.sections_pass < inputNumber);
		case "fail":
			return Promise.resolve(section.sections_fail < inputNumber);
		case "audit":
			return Promise.resolve(section.sections_audit < inputNumber);
		case "year":
			return Promise.resolve(section.sections_year < inputNumber);
		default:
			return false;
	}
}

async function handleEQ(eq: any, section: Section): Promise<boolean> {
	let mKeys = Object.keys(eq);
	let mKey = mKeys[0];
	let mKeyArray = mKey.split("_");
	let mField = mKeyArray[1];
	let inputNumber = eq[mKey];

	switch (mField) {
		case "avg":
			return Promise.resolve(section.sections_avg === inputNumber);
		case "pass":
			return Promise.resolve(section.sections_pass === inputNumber);
		case "fail":
			return Promise.resolve(section.sections_fail === inputNumber);
		case "audit":
			return Promise.resolve(section.sections_audit === inputNumber);
		case "year":
			return Promise.resolve(section.sections_year === inputNumber);
		default:
			return Promise.resolve(false);
	}
}

async function handleIS(is: any, section: Section): Promise<boolean> {
	let sKeys = Object.keys(is);
	let sKey = sKeys[0];
	let sKeyArray = sKey.split("_");
	let sField = sKeyArray[1];
	let inputString = is[sKey];

	// https://medium.com/trabe/using-switch-true-in-javascript-986e8ad8ae4f
	try {
		switch (true) {
			case inputString.charAt(0) === "*" && inputString.charAt(inputString.length - 1) === "*":
				return await asteriskAtBoth(inputString, sField, section);
			case inputString.charAt(0) === "*":
				return await asteriskAtFront(inputString, sField, section);
			case inputString.charAt(inputString.length - 1) === "*":
				return await asteriskAtEnd(inputString, sField, section);
			default:
				return await noAsterisk(inputString, sField, section);
		}
	} catch (error) {
		return Promise.reject(new InsightError("failed to handle"));
	}
}

// enum AsteriskPosition {
// 	Front,
// 	End,
// 	Both,
// }

// async function asteriskHandler(
// 	inputString: string,
// 	sField: string,
// 	section: Section,
// 	position: AsteriskPosition
// ): Promise<boolean> {
// 	let input;
// 	switch (position) {
// 		case AsteriskPosition.Front:
// 			input = inputString.slice(1);
// 			break;
// 		case AsteriskPosition.End:
// 			input = inputString.slice(0, inputString.length - 1);
// 			break;
// 		case AsteriskPosition.Both:
// 			input = inputString.slice(1, inputString.length - 1);
// 			break;
// 	}
// 	switch (sField) {
// 		case "dept":
// 			return Promise.resolve(section.sections_dept.includes(input));
// 		case "id":
// 			return Promise.resolve(section.sections_id.includes(input));
// 		case "instructor":
// 			return Promise.resolve(section.sections_instructor.includes(input));
// 		case "title":
// 			return Promise.resolve(section.sections_title.includes(input));
// 		case "uuid":
// 			return Promise.resolve(section.sections_uuid.includes(input));
// 		default:
// 			return Promise.resolve(false);
// 	}
// }

async function asteriskAtBoth(inputString: string, sField: string, section: Section): Promise<boolean> {
	let input = inputString.slice(1, inputString.length - 1);
	switch (sField) {
		case "dept":
			return Promise.resolve(section.sections_dept.includes(input));
		case "id":
			return Promise.resolve(section.sections_id.includes(input));
		case "instructor":
			return Promise.resolve(section.sections_instructor.includes(input));
		case "title":
			return Promise.resolve(section.sections_title.includes(input));
		case "uuid":
			return Promise.resolve(section.sections_uuid.includes(input));
		default:
			return Promise.resolve(false);
	}
}

async function asteriskAtFront(inputString: string, sField: string, section: Section): Promise<boolean> {
	let input = inputString.slice(1);
	switch (sField) {
		case "dept":
			return Promise.resolve(section.sections_dept.endsWith(input));
		case "id":
			return Promise.resolve(section.sections_id.endsWith(input));
		case "instructor":
			return Promise.resolve(section.sections_instructor.endsWith(input));
		case "title":
			return Promise.resolve(section.sections_title.endsWith(input));
		case "uuid":
			return Promise.resolve(section.sections_uuid.endsWith(input));
		default:
			return Promise.resolve(false);
	}
}

async function asteriskAtEnd(inputString: string, sField: string, section: Section): Promise<boolean> {
	let input = inputString.slice(0, inputString.length - 1);
	switch (sField) {
		case "dept":
			return Promise.resolve(section.sections_dept.startsWith(input));
		case "id":
			return Promise.resolve(section.sections_id.startsWith(input));
		case "instructor":
			return Promise.resolve(section.sections_instructor.startsWith(input));
		case "title":
			return Promise.resolve(section.sections_title.startsWith(input));
		case "uuid":
			return Promise.resolve(section.sections_id.startsWith(input));
		default:
			return Promise.resolve(false);
	}
}

async function noAsterisk(inputString: string, sField: string, section: Section): Promise<boolean> {
	switch (sField) {
		case "dept":
			return Promise.resolve(section.sections_dept === inputString);
		case "id":
			return Promise.resolve(section.sections_id === inputString);
		case "instructor":
			return Promise.resolve(section.sections_instructor === inputString);
		case "title":
			return Promise.resolve(section.sections_title === inputString);
		case "uuid":
			return Promise.resolve(section.sections_id === inputString);
		default:
			return Promise.resolve(false);
	}
}

export {filterHandler};
