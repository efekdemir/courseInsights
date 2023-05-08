import {RoomsDataset, SectionsDataset} from "./DatasetModel";
import JSZip from "jszip";
import {InsightError} from "../../controller/IInsightFacade";
import {Section} from "./SectionModel";

export class DatasetMapper {
	public datasetMap: Map<string, SectionsDataset | RoomsDataset>;
	public readonly datasetKeys: string[];

	constructor() {
		this.datasetMap = new Map();
		this.datasetKeys = [];
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
	// public validateFields(i: any, requiredFields: string[]): boolean {
	// 	return requiredFields.every((field) => field in i);
	// }

	public async addSection(id: string, zip: JSZip): Promise<string[]> {
		let dataset = new SectionsDataset();
		let promises: any[] = [];
		try {
			zip.folder("courses")?.forEach((path, zipFile) => {
				let object;
				promises.push(
					zipFile.async("string").then((file) => {
						try {
							object = JSON.parse(file);
							// const requiredFields = ["Subject", "Course", "Avg", "Professor", "Title",
							// 	"Pass", "Fail", "Audit", "id", "Section", "Year"];
							for (let i of object.result) {
								dataset.sections.push(this.sectionGenerator(i));
								// if (this.validateFields(i, requiredFields)) {
								// } else {
								// 	return Promise.reject(new InsightError("Invalid Fields"));
								// }
							}
						} catch (error) {
							return;
						}
					})
				);
			});
		} catch (error) {
			return Promise.reject(new InsightError("Error"));
		}
		// console.timeEnd("part2");
		// console.time("part3");
		this.datasetKeys.push(id);
		try {
			return Promise.all(promises).then(() => {
				if (dataset.sections.length !== 0) {
					dataset.id = id;
					dataset.numRows = dataset.sections.length;
					this.datasetMap.set(id, dataset);
				} else {
					return Promise.reject(new InsightError("Could not add section"));
				}
				return this.datasetKeys;
			});
		} catch (error) {
			return Promise.reject(new InsightError("Could not add section"));
		}
		// part 3 takes over 1 second, need to fix
		// console.timeEnd("part3");
		// let keys = Array.from(this.datasetMap.keys());
		// return Promise.resolve(keys);
	}

	private sectionGenerator(file: any) {
		let section: Section = new Section();
		section.sections_id = file.Course;
		section.sections_uuid = "" + file.id;
		section.sections_title = file.Title;
		section.sections_instructor = file.Professor;
		section.sections_dept = file.Subject;
		if (file.Section === "overall") {
			section.sections_year = 1900;
		} else {
			section.sections_year = parseInt(file.Year, 10);
		}
		section.sections_avg = file.Avg;
		section.sections_pass = file.Pass;
		section.sections_fail = file.Fail;
		section.sections_audit = file.Audit;
		return section;
	}
}
