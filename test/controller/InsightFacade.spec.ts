import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";
import * as fs from "fs-extra";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let rooms: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		rooms = getContentFromArchives("campus.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			// console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			// console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			// console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			// console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		// This is a unit test. You should create more like this!
		it("should reject with  an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return expect(result).to.eventually.be.rejectedWith(InsightError);
		});
	});
	// it("should successfully add and then remove the rooms dataset", function () {
	// 	return facade.addDataset("valid-dataset-id", rooms, InsightDatasetKind.Rooms)
	// 		.then((addedDataset) => {
	// 			expect(addedDataset).to.be.instanceof(Array);
	// 			expect(addedDataset).to.have.length(1);
	// 			expect(addedDataset).to.eql(["valid-dataset-id"]);
	// 			return facade.removeDataset("valid-dataset-id");
	// 		})
	// 		.then(() => facade.listDatasets())
	// 		.then((datasets) => {
	// 			expect(datasets).to.be.instanceof(Array);
	// 			expect(datasets).to.have.length(0);
	// 			expect(datasets).to.eql([]);
	// 		});
	// });
	//
	// it("should add two valid rooms datasets and then list them without throwing error", function () {
	// 	let roomsOne = getContentFromArchives("campus.zip");
	// 	let roomsTwo = getContentFromArchives("campus.zip");
	// 	facade.addDataset("valid-dataset-one", roomsOne, InsightDatasetKind.Rooms);
	// 	return facade.addDataset("valid-dataset-two", roomsTwo, InsightDatasetKind.Rooms)
	// 		.then((addedDatasets) => {
	// 			expect(addedDatasets).to.be.instanceof(Array);
	// 			expect(addedDatasets).to.have.length(2);
	// 			expect(addedDatasets).to.deep.equal(["valid-dataset-one", "valid-dataset-two"]);
	// 		})
	// 		.then(() => facade.listDatasets())
	// 		.then((datasets) => {
	// 			expect(datasets).to.be.instanceof(Array);
	// 			expect(datasets).to.have.length(2);
	// 			// expect(datasets).to.eql([]);
	// 		});
	// });
	//
	// 		it("should list 2 datasets after handling crash", async function () {
	// 			await facade.addDataset("old", sections, InsightDatasetKind.Sections);
	// 			let newFacade: InsightFacade = new InsightFacade();
	// 			return await newFacade.addDataset("new", sections, InsightDatasetKind.Sections)
	// 				.then(() => newFacade.listDatasets())
	// 				.then((datasets) => {
	// 					expect(fs.existsSync("./data/old")).to.equal(true);
	// 					expect(fs.existsSync("./data/new")).to.equal(true);
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(2);
	// 				});
	// 		});
	//
	// 		it("should successfully list one rooms dataset", function () {
	// 			return facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)
	// 				.then(() => {
	// 					return facade.listDatasets();
	// 				})
	// 				.then((datasets) => {
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(1);
	// 				});
	// 		});
	// 	});
	//
	// 		it("should add a valid dataset without throwing error", function () {
	// 			return facade.addDataset("validDatasetId", sections, InsightDatasetKind.Sections)
	// 				.then((addedDataset) => {
	// 					expect(addedDataset).to.be.instanceof(Array);
	// 					expect(addedDataset).to.have.length(1);
	// 					expect(addedDataset).to.eql(["validDatasetId"]);
	// 				});
	// 		});
	//
	//
	// 		it("should add two valid section datasets and then list them without throwing error", function () {
	// 			let coursesOne = getContentFromArchives("coursesOne.zip");
	// 			let coursesTwo = getContentFromArchives("coursesTwo.zip");
	// 			facade.addDataset("valid-dataset-one", coursesOne, InsightDatasetKind.Sections);
	// 			return facade.addDataset("valid-dataset-two", coursesTwo, InsightDatasetKind.Sections)
	// 				.then((addedDatasets) => {
	// 					expect(addedDatasets).to.be.instanceof(Array);
	// 					expect(addedDatasets).to.have.length(2);
	// 					expect(addedDatasets).to.deep.equal(["valid-dataset-one", "valid-dataset-two"]);
	// 				})
	// 				.then(() => facade.listDatasets())
	// 				.then((datasets) => {
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(2);
	// 					// expect(datasets).to.eql([]);
	// 				});
	// 		});
	//
	// 		it("should throw InsightError when dataset id has underscore", function () {
	// 			const result = facade.addDataset("invalid_dataset", sections, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when dataset id is empty", function () {
	// 			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when dataset id is only whitespace", function () {
	// 			const result = facade.addDataset("  ", sections, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when a second dataset is added with a duplicate id", async function () {
	// 			await facade.addDataset("duplicate-id", sections, InsightDatasetKind.Sections);
	// 			try {
	// 				await facade.addDataset("duplicate-id", sections, InsightDatasetKind.Sections);
	// 			} catch (error) {
	// 				expect(error).to.be.instanceof(InsightError);
	// 			}
	// 		});
	//
	// 		it("should throw InsightError when attempting to add a non-zip dataset file", function () {
	// 			let nonZipDataset = getContentFromArchives("nonZipDataset.rtf");
	// 			const result = facade.addDataset("invalid-dataset", nonZipDataset, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when attempting to add a dataset with no courses", function () {
	// 			let noCoursesDataset = getContentFromArchives("noCourses.zip");
	// 			const result = facade.addDataset("invalid-dataset", noCoursesDataset, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a dataset with non-JSON course file", function () {
	// 			let nonJSONCourseDataset = getContentFromArchives("invalidCourseFormat.zip");
	// 			const result = facade.addDataset("invalid-dataset", nonJSONCourseDataset, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a dataset with an invalid JSON course file", function () {
	// 			let invalidJSON = getContentFromArchives("invalidCourse.zip");
	// 			const result = facade.addDataset("invalid-dataset", invalidJSON, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a dataset with no result key in course file", function () {
	// 			let noResult = getContentFromArchives("noResult.zip");
	// 			const result = facade.addDataset("invalid-dataset", noResult, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a dataset with one valid and one invalid courses", function () {
	// 			let oneGoodOneBad = getContentFromArchives("oneGoodOneBad.zip");
	// 			const result = facade.addDataset("invalid-dataset", oneGoodOneBad, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a dataset with no courses directory", function () {
	// 			let noCoursesDirectory = getContentFromArchives("badLocation.zip");
	// 			const result = facade.addDataset("invalid-dataset", noCoursesDirectory, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should throw InsightError when adding a course with invalid query keys", function () {
	// 			let noAverageCourseDataset = getContentFromArchives("noAvgCourse.zip");
	// 			const result = facade.addDataset("invalid-dataset", noAverageCourseDataset, InsightDatasetKind.Sections);
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	//
	// 		it("should successfully add and then remove the section dataset", function () {
	// 			return facade.addDataset("valid-dataset-id", sections, InsightDatasetKind.Sections)
	// 				.then((addedDataset) => {
	// 					expect(addedDataset).to.be.instanceof(Array);
	// 					expect(addedDataset).to.have.length(1);
	// 					expect(addedDataset).to.eql(["valid-dataset-id"]);
	// 					return facade.removeDataset("valid-dataset-id");
	// 				})
	// 				.then(() => facade.listDatasets())
	// 				.then((datasets) => {
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(0);
	// 					expect(datasets).to.eql([]);
	// 				});
	// 		});
	//
	// 		it("should successfully add and then list the dataset", function () {
	// 			return facade.addDataset("valid-dataset-id", sections, InsightDatasetKind.Sections)
	// 				.then((addedDataset) => {
	// 					expect(addedDataset).to.be.instanceof(Array);
	// 					expect(addedDataset).to.have.length(1);
	// 					expect(addedDataset).to.eql(["valid-dataset-id"]);
	// 					return facade.listDatasets();
	// 				})
	// 				.then((datasets) => {
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(1);
	// 					// expect(datasets).to.eql([]);
	// 				});
	// 		});
	//
	// 		it("should list empty array when no datasets have been added", function () {
	// 			return facade.listDatasets()
	// 				.then((datasets) => {
	// 					expect(datasets).to.be.instanceof(Array);
	// 					expect(datasets).to.have.length(0);
	// 					expect(datasets).to.eql([]);
	// 				});
	// 		});
	//
	// 		it("should throw NotFoundError when removing unknown dataset id", function () {
	// 			facade.addDataset("valid-dataset-id", sections, InsightDatasetKind.Sections);
	// 			const result = facade.removeDataset("invalid-dataset-id");
	// 			return expect(result).eventually.to.be.rejectedWith(NotFoundError);
	// 		});
	//
	// 		it("should throw InsightError when removing invalid id", function () {
	// 			facade.addDataset("valid-dataset-id", sections, InsightDatasetKind.Sections);
	// 			const result = facade.removeDataset("invalid_dataset_id");
	// 			return expect(result).eventually.to.be.rejectedWith(InsightError);
	// 		});
	// 	});
	//
	// 	/*
	// 	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	// 	 * You should not need to modify it; instead, add additional files to the queries' directory.
	// 	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	// 	 */
	// 	describe("PerformQuery", () => {
	// 		before(function () {
	// 			// console.info(`Before: ${this.test?.parent?.title}`);
	//
	// 			facade = new InsightFacade();
	//
	// 			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
	// 			// Will *fail* if there is a problem reading ANY dataset.
	// 			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];
	//
	// 			return Promise.all(loadDatasetPromises);
	// 		});
	//
	// 		after(function () {
	// 			// console.info(`After: ${this.test?.parent?.title}`);
	// 			clearDisk();
	// 		});
	//
	// 		type PQErrorKind = "ResultTooLargeError" | "InsightError";
	//
	// 		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
	// 			"Dynamic InsightFacade PerformQuery tests",
	// 			(input) => facade.performQuery(input),
	// 			"./test/resources/queries",
	// 			{
	// 				assertOnResult: (actual, expected) => {
	// 					expect(actual).to.be.instanceof(Array);
	// 					expect(actual).to.deep.equal(expected);
	// 				},
	// 				errorValidator: (error): error is PQErrorKind =>
	// 					error === "ResultTooLargeError" || error === "InsightError",
	// 				assertOnError: (actual, expected) => {
	// 					if (expected === "InsightError") {
	// 						expect(actual).to.be.instanceof(InsightError);
	// 					} else if (expected === "ResultTooLargeError") {
	// 						expect(actual).to.be.instanceof(ResultTooLargeError);
	// 					} else {
	// 						// this should be unreachable
	// 						expect.fail("UNEXPECTED ERROR");
	// 					}
	// 				},
	// 			}
	// 		);
	// 	});
});
