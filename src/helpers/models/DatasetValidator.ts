import * as fs from "fs-extra";

export class DatasetValidator {
	public invalidID(id: string): boolean {
		return id.length === 0 || id.includes(" ") || id.includes("_");
	}

	public alreadyExists(id: string): boolean {
		return fs.existsSync(`./data/${id}`);
	}
}
