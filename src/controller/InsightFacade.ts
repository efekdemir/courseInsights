import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import {queryValidatorAsync} from "../helpers/performQuery/queryValidator";
import {Section} from "../helpers/models/SectionModel";
import {Dataset, RoomsDataset, SectionsDataset} from "../helpers/models/DatasetModel";
import {DatasetValidator} from "../helpers/models/DatasetValidator";
import * as fs from "fs-extra";
import JSZip from "jszip";
import {querySectionsResult} from "../helpers/performQuery/queryResult";
import {DatasetMapper} from "../helpers/models/DatasetMapper";
import RoomHandler from "../helpers/models/RoomHandler";
import {parse} from "parse5";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	public section: Section;
	public sectionsDataset: SectionsDataset;
	public databaseValidator: DatasetValidator;
	public datasetMapper: DatasetMapper;
	public roomHandler: RoomHandler;

	constructor() {
		// console.log("InsightFacadeImpl::init()");
		this.section = new Section();
		this.sectionsDataset = new SectionsDataset();
		this.databaseValidator = new DatasetValidator();
		this.datasetMapper = new DatasetMapper();
		this.roomHandler = new RoomHandler();
		// this.diskInitializer().then();
	}

	/**
	 * This is the main programmatic entry point for the project.
	 * Method documentation is in IInsightFacade
	 *
	 */

	// private async diskInitializer() {
	// 	try {
	// 		let files = await fs.promises.readdir("data");
	// 		if (files.length === 0) {
	// 			return;
	// 		}
	// 		for (let file of files) {
	// 			let dataset = JSON.parse(fs.readFileSync("data/" + file, "base64"));
	// 			let id = dataset.id;
	// 			this.datasetMapper.datasetMap.set(id, dataset);
	// 		}
	// 	} catch (error) {
	// 		return Promise.reject(new InsightError("Could not initialize from disk"));
	// 	}
	// }

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		let zip = new JSZip();
		if (this.databaseValidator.invalidID(id) || this.databaseValidator.alreadyExists(id)) {
			return Promise.reject(new InsightError("Invalid Dataset ID"));
		} else if (kind === "sections") {
			// console.timeEnd("part1");
			// console.time("part2");
			return zip
				.loadAsync(content, {base64: true})
				.then((data: JSZip) => {
					if (!fs.existsSync("./data")) {
						fs.mkdirSync("./data");
					}
					fs.writeFileSync(`./data/${id}`, content);
					return this.datasetMapper.addSection(id, data);
				})
				.catch((error) => {
					return Promise.reject(new InsightError(error));
				});
		} else if (kind === "rooms") {
			await zip
				.loadAsync(content, {base64: true})
				.then((data: JSZip) => {
					if (!fs.existsSync("./data")) {
						fs.mkdirSync("./data");
					}
					fs.writeFileSync(`./data/${id}`, content);
					let index = data.files["index.htm"].async("text");
					return Promise.resolve(index);
				})
				.then(async (index) => {
					let document = parse(index);
					await this.roomHandler.documentBodyFinder(document);
					let buildings = this.roomHandler.roomsParser();
					// console.time("part4");
					// this part is really time-consuming
					// console.time("parsing rooms");
					await this.roomHandler.roomDetailsGetter(await buildings, content);
					// console.timeEnd("part4");
				})
				.catch((error) => {
					return Promise.reject(new InsightError(error));
				});
			let roomsDataset = await this.roomHandler.addRoomsDataset(id);
			this.datasetMapper.datasetMap.set(id, roomsDataset);
			this.datasetMapper.datasetKeys.push(id);
			return this.datasetMapper.datasetKeys;
		} else {
			return Promise.reject(new InsightError("InsightError"));
		}
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		if (!(await queryValidatorAsync(query))) {
			return Promise.reject(new InsightError("Invalid Query"));
		}
		let validQuery: any;
		if (typeof query === "object") {
			try {
				if (query !== null) {
					validQuery = query;
				} else if (typeof query === "string") {
					validQuery = await JSON.parse(query);
				}
			} catch (error) {
				return Promise.reject(new InsightError("Invalid Query"));
			}
		} else {
			return Promise.reject(new InsightError("Invalid Query"));
		}
		try {
			let datasetName = this.datasetNameGenerator(query);
			// console.log(datasetName);
			let dataset: SectionsDataset | RoomsDataset | undefined = this.datasetMapper.datasetMap.get(datasetName);
			if (!dataset) {
				return Promise.reject(new InsightError("Dataset not found"));
			}
			if (dataset instanceof SectionsDataset) {
				let result: InsightResult[] = await querySectionsResult(validQuery, dataset);
				// console.log("got here 6");
				// console.log(result);
				if (result.length > 5000) {
					return Promise.reject(new ResultTooLargeError("Too Large"));
				}
				return Promise.resolve(result);
			} else {
				return Promise.reject("not implemented yet");
			}
		} catch (error) {
			return Promise.reject(new InsightError("Could not perform query"));
		}
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		let insightDatasets: InsightDataset[] = [];
		let datasetMap = this.datasetMapper.datasetMap;
		let datasetKeys = this.datasetMapper.datasetKeys;
		try {
			for (let key of datasetKeys) {
				let dataset = datasetMap.get(key);
				// console.log(dataset);
				if (!dataset) {
					return Promise.resolve([]);
				}
				let insightDataset: InsightDataset = new Dataset();
				insightDataset.id = dataset.id;
				insightDataset.kind = dataset.kind;
				insightDataset.numRows = dataset.numRows;
				// console.log(insightDataset);
				insightDatasets.push(insightDataset);
			}
		} catch (error) {
			return Promise.resolve([]);
		}
		return Promise.resolve(insightDatasets);
	}

	public datasetNameGenerator(query: any): string {
		let options: any = query["OPTIONS"];
		let columns: any[] = options["COLUMNS"];
		let keyString = columns[0].split("_");
		// console.log(datasetName);
		return keyString[0];
	}

	public async removeDataset(id: string): Promise<string> {
		if (this.databaseValidator.invalidID(id)) {
			return Promise.reject(new InsightError("Invalid ID"));
		} else if (!this.databaseValidator.alreadyExists(id)) {
			return Promise.reject(new NotFoundError("ID not found"));
		} else {
			try {
				await fs.removeSync("./data/" + id);
			} catch (error) {
				return Promise.reject(new InsightError("Could not remove"));
			}
			this.datasetMapper.datasetMap.delete(id);
			return Promise.resolve(id);
		}
	}
}
