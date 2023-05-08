import {Section} from "./SectionModel";
import {InsightDataset, InsightDatasetKind} from "../../controller/IInsightFacade";
import Room from "./RoomModel";

export class Dataset implements InsightDataset {
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;

	constructor() {
		this.id = "";
		this.kind = InsightDatasetKind.Sections;
		this.numRows = 0;
	}
}

export class SectionsDataset implements InsightDataset {
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;
	public sections: Section[];

	constructor() {
		this.id = "";
		this.kind = InsightDatasetKind.Sections;
		this.numRows = 0;
		this.sections = [];
	}
}

export class RoomsDataset implements InsightDataset {
	public id: string;
	public kind: InsightDatasetKind;
	public numRows: number;
	public rooms: Room[];

	constructor() {
		this.id = "";
		this.kind = InsightDatasetKind.Rooms;
		this.numRows = 0;
		this.rooms = [];
	}
}
