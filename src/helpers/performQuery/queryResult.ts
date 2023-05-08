import {Section} from "../../helpers/models/SectionModel";
import {SectionsDataset} from "../../helpers/models/DatasetModel";
import {InsightError, InsightResult} from "../../controller/IInsightFacade";
import {filterHandler} from "./filterHandler";

let querySectionsResult = async (query: any, dataset: SectionsDataset) => {
	let sections: Section[];
	let courses = dataset.sections;
	let where = query["WHERE"];
	let whereKeys = Object.keys(where);
	// console.log(whereKeys);
	let options = query["OPTIONS"];
	let optionsKeys: any[] = Object.keys(options);
	// console.log(optionsKeys);
	let columns = options["COLUMNS"];

	if (whereKeys.length === 0) {
		sections = courses;
	} else {
		// console.log("inside where add");
		try {
			sections = await addSections(where, courses);
		} catch (error) {
			return Promise.reject(new InsightError("Error"));
		}
	}

	let sortedSections: Section[];

	if (optionsKeys.length === 2) {
		let order: any = options["ORDER"];
		try {
			sortedSections = await sectionSorter(order, sections);
		} catch (error) {
			return Promise.reject(new InsightError("Error sorting"));
		}
	} else {
		sortedSections = sections;
	}

	return Promise.resolve(getColumns(columns, sortedSections));
};

async function addSections(where: any, coursesArray: Section[]): Promise<Section[]> {
	let addedSections: Section[] = [];
	try {
		for await (let section of coursesArray) {
			if (await filterHandler(where, section)) {
				if(!(addedSections.includes(section))) {
					addedSections.push(section);
				}
				// console.log(addedSections);
				// console.log(addedSections.length);
			}
		}
	} catch (error) {
		return Promise.reject(new InsightError("Error"));
	}
	return addedSections;
}

// sorting numbers: https://www.w3schools.com/js/js_array_sort.asp
// sorting strings: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
async function sectionSorter(order: any, sections: Section[]) {
	let keyString = order.split("_");
	let field = keyString[1];
	let sortedSections: Section[] = [];
	switch (field) {
		case "avg":
			sortedSections = sections.sort(
				(sectionOne, sectionTwo) => sectionOne.sections_avg - sectionTwo.sections_avg);
			break;
		case "pass":
			sortedSections = sections.sort(
				(sectionOne, sectionTwo) => sectionOne.sections_pass - sectionTwo.sections_pass);
			break;
		case "fail":
			sortedSections = sections.sort(
				(sectionOne, sectionTwo) => sectionOne.sections_fail - sectionTwo.sections_fail);
		case "audit":
			sortedSections = sections.sort(
				(sectionOne, sectionTwo) => sectionOne.sections_audit - sectionTwo.sections_audit);
			break;
		case "year":
			sortedSections = sections.sort(
				(sectionOne, sectionTwo) => sectionOne.sections_year - sectionTwo.sections_year);
			break;
		case "dept":
			sortedSections = sections.sort((sectionOne, sectionTwo) =>
				sectionOne.sections_dept.localeCompare(sectionTwo.sections_dept));
			break;
		case "id":
			sortedSections = sections.sort((sectionOne, sectionTwo) =>
				sectionOne.sections_id.localeCompare(sectionTwo.sections_id));
			break;
		case "instructor":
			sortedSections = sections.sort((sectionOne, sectionTwo) =>
				sectionOne.sections_instructor.localeCompare(sectionTwo.sections_instructor));
			break;
		case "title":
			sortedSections = sections.sort((sectionOne, sectionTwo) =>
				sectionOne.sections_title.localeCompare(sectionTwo.sections_title));
			break;
		case "uuid":
			sortedSections = sections.sort((sectionOne, sectionTwo) =>
				sectionOne.sections_uuid.localeCompare(sectionTwo.sections_uuid));
			break;
		default:
			sortedSections = sections;
			break;
	}
	return sortedSections;
}

async function getColumns(columns: string[], sortedSections: Section[]): Promise<InsightResult[]> {
	let results: InsightResult[] = [];
	for (let section of sortedSections) {
		let insightResult: InsightResult = {};
		for (let key of columns) {
			let keyString = key.split("_");
			// console.log(keyString);
			let field = keyString[1];
			// console.log(field);
			switch (field) {
				case "avg":
					insightResult[key] = section.sections_avg;
					break;
				case "pass":
					insightResult[key] = section.sections_pass;
					break;
				case "fail":
					insightResult[key] = section.sections_fail;
					break;
				case "audit":
					insightResult[key] = section.sections_audit;
					break;
				case "year":
					insightResult[key] = section.sections_year;
					break;
				case "dept":
					insightResult[key] = section.sections_dept;
					break;
				case "id":
					insightResult[key] = section.sections_id;
					break;
				case "instructor":
					insightResult[key] = section.sections_instructor;
					break;
				case "title":
					insightResult[key] = section.sections_title;
					break;
				case "uuid":
					insightResult[key] = section.sections_uuid;
					break;
			}
		}

		results.push(insightResult);
	}

	return Promise.resolve(results);
}

export {querySectionsResult};
