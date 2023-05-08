import Server from "../../src/rest/Server";
import {expect} from "chai";
import request from "supertest";
import {clearDisk} from "../TestUtil";
import * as fs from "fs-extra";

describe("Server", () => {
	// let facade: InsightFacade;
	let server: Server;
	let cpsc: Buffer;
	let invalidCourse: Buffer;
	before(async () => {
		// clearDisk();
		// // facade = new InsightFacade();
		// server = new Server(4321);
		// cpsc = fs.readFileSync("test/resources/archives/CPSC.zip");
		// invalidCourse = fs.readFileSync("test/resources/archives/invalidCourse.zip");
		// await server.start();
		// console.log("error");
	});

	after(async () => {
		// await server.stop();
	});

	beforeEach(async () => {
		clearDisk();
		// facade = new InsightFacade();
		server = new Server(4321);
		cpsc = fs.readFileSync("test/resources/archives/CPSC.zip");
		invalidCourse = fs.readFileSync("test/resources/archives/invalidCourse.zip");
		await server.start();
		console.log("error");
	});

	afterEach(async () => {
		await server.stop();
	});

	// Sample on how to format PUT requests
	it("passing PUT test for cpsc dataset", async () => {
		const res = await request("http://localhost:4321")
			.put("/dataset/cpsc/sections")
			.send(cpsc)
			.set("Content-Type", "application/x-zip-compressed");
		expect(res.status).to.be.equal(200, JSON.stringify(res.body));
		expect(res.body.result).to.be.instanceof(Array);
		expect(res.body.result).to.have.length(1);
		await request("http://localhost:4321").delete("/dataset/cpsc");
	});
	it("passing DELETE test for dataset", async () => {
		const res1 = await request("http://localhost:4321")
			.put("/dataset/cpsc/sections")
			.send(cpsc)
			.set("Content-Type", "application/x-zip-compressed");
		expect(res1.status).to.be.equal(200, JSON.stringify(res1.body));
		expect(res1.body.result).to.be.instanceOf(Array);
		expect(res1.body.result).to.have.length(1);
		const res2 = await request("http://localhost:4321").delete("/dataset/cpsc");
		expect(res2.status).to.be.equal(200, JSON.stringify(res2.body));
		expect(res2.body.result).to.equal("cpsc");
		const res3 = await request("http://localhost:4321").get("/datasets");
		expect(res3.status).to.be.equal(200, JSON.stringify(res3.body));
		expect(res3.body.result).to.be.instanceof(Array);
		expect(res3.body.result).to.have.length(0);
	});
	it("failing PUT test for dataset", async () => {
		const res = await request("http://localhost:4321")
			.put("/dataset/invalidCourse/sections")
			.send(invalidCourse)
			.set("Content-Type", "application/x-zip-compressed");
		expect(res.status).to.be.equal(400, JSON.stringify(res.body));
	});
	it("failing DELETE test for dataset", async () => {
		let res1 = await request("http://localhost:4321")
			.put("/dataset/cpsc/sections")
			.send(cpsc)
			.set("Content-Type", "application/x-zip-compressed");
		expect(res1.status).to.be.equal(200, JSON.stringify(res1.body));
		expect(res1.body.result).to.be.instanceof(Array);
		const res2 = await request("http://localhost:4321").delete("/dataset/comm");
		expect(res2.status).to.be.equal(404, JSON.stringify(res2.body));
	});
	it("passing GET test for dataset", async () => {
		let response = await request("http://localhost:4321")
			.put("/dataset/cpsc/sections")
			.send(cpsc)
			.set("Content-Type", "application/x-zip-compressed");
		expect(response.status).to.be.equal(200, JSON.stringify(response.body));
		expect(response.body.result).to.be.instanceof(Array);
		expect(response.body.result).to.have.length(1);
		const res2 = await request("http://localhost:4321").get("/datasets");
		expect(res2.status).to.be.equal(200, JSON.stringify(res2.body));
		expect(res2.body.result).to.be.instanceof(Array);
		expect(res2.body.result).to.have.length(1);
	});
	it("failing GET test for dataset", async () => {
		const res1 = await request("http://localhost:4321")
			.put("/dataset/cpsc/sections")
			.send(cpsc)
			.set("Content-Type", "application/x-zip-compressed");
		expect(res1.status).to.be.equal(200, JSON.stringify(res1.body));
		expect(res1.body.result).to.be.instanceof(Array);
		expect(res1.body.result).to.have.length(1);
		const res2 = await request("http://localhost:4321").get("/datasetss");
		expect(res2.status).to.be.equal(404, JSON.stringify(res2.body));
	});
	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
