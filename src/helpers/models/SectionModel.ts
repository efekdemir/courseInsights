import JSZip from "jszip";
import {InsightError} from "../../controller/IInsightFacade";
import {SectionsDataset} from "./DatasetModel";
export class Section {
	public sections_uuid: string;
	public sections_id: string;
	public sections_title: string;
	public sections_instructor: string;
	public sections_dept: string;
	public sections_year: number;
	public sections_avg: number;
	public sections_pass: number;
	public sections_fail: number;
	public sections_audit: number;

	constructor() {
		this.sections_uuid = "";
		this.sections_title = "";
		this.sections_id = "";
		this.sections_instructor = "";
		this.sections_dept = "";
		this.sections_year = 0;
		this.sections_avg = 0;
		this.sections_pass = 0;
		this.sections_fail = 0;
		this.sections_audit = 0;
	}
}
