import {parse} from "parse5";
import http from "http";
import JSZip from "jszip";
import {InsightDatasetKind, InsightError} from "../../controller/IInsightFacade";
import Room from "./RoomModel";
import {RoomsDataset} from "./DatasetModel";

let zip = new JSZip();
export default class RoomHandler {
	public body: any;
	public campusBody: any;
	public addresses: any = {};
	public rooms: Room[] = [];

	public addRoomsDataset(id: string): RoomsDataset {
		if (this.rooms.length !== 0) {
			let roomsDataset = new RoomsDataset();
			roomsDataset.id = id;
			roomsDataset.kind = InsightDatasetKind.Rooms;
			roomsDataset.rooms = this.rooms;
			roomsDataset.numRows = this.rooms.length;
			// console.log(this.rooms);
			return roomsDataset;
		} else {
			throw new InsightError("Rooms empty");
		}
	}

	public async documentBodyFinder(node: any): Promise<any> {
		// console.log(node.childNodes);
		try {
			if (node && node.childNodes) {
				for await (let childNode of node.childNodes) {
					if (childNode.nodeName.includes("tbody")) {
						this.body = childNode;
						// console.log(this.body);
						return this.body;
					} else {
						await this.documentBodyFinder(childNode);
					}
				}
			}
			return this.body;
		} catch (error) {
			return new InsightError("failed to find body");
		}
	}

	public async roomsParser(): Promise<any> {
		let nodes = this.body.childNodes;
		// console.log(nodes);
		// console.log("got here y1o");
		let buildings = [];
		try {
			for (let i of nodes) {
				// console.log(i);
				// console.log(i.nodeName);
				if (i.nodeName === "tr") {
					let tr = i;
					let buildingHref, roomShortname, roomFullname, roomAddress;
					// console.log("got here yo2");
					for (let j of tr.childNodes) {
						if (j.nodeName === "td") {
							let td = j;
							if (td.attrs[0].value.includes("title")) {
								buildingHref = td.childNodes[1].attrs[0].value;
								roomFullname = td.childNodes[1].childNodes[0].value;
							} else if (td.attrs[0].value.includes("code")) {
								roomShortname = td.childNodes[0].value.replace(/\s+/g, "");
							} else if (td.attrs[0].value.includes("address")) {
								roomAddress = td.childNodes[0].value.trim();
							}
						}
					}
					// console.log("got here yo");
					if (buildingHref && roomAddress && roomShortname && roomFullname) {
						let building = {
							fullname: roomFullname,
							shortname: roomShortname,
							address: roomAddress,
							href: buildingHref,
						};
						buildings.push(building);
					}
				}
			}
			return Promise.resolve(buildings);
		} catch (error) {
			return Promise.reject(new InsightError("could not parse :("));
		}
	}

	public async roomDetailsGetter(buildings: any[], content: any): Promise<any> {
		try {
			// console.time("part1");
			await zip
				.loadAsync(content, {base64: true})
				.then((data) => {
					let details: any[] = [];
					data.folder("campus")?.forEach((path, zipFile) => {
						details.push(zipFile.async("string"));
					});
					return Promise.all(details);
				})
				.catch((error) => {
					return Promise.reject(new InsightError(error));
				})
				.then((details) => {
					// console.timeEnd("part1");
					for (let i = 0; i < Object.keys(buildings).length; i++) {
						let html = parse(details[i]);
						this.campusTBodyFinder(html);
						if (this.campusBody) {
							let roomDetails = this.campusDetailsGetter();
							for (let roomDetail of roomDetails) {
								let room = new Room(
									buildings[i].fullname,
									buildings[i].shortname,
									roomDetail.number,
									buildings[i].shortname + "_" + roomDetail.number,
									buildings[i].address,
									0,
									0,
									roomDetail.capacity, roomDetail.type, roomDetail.furniture, roomDetail.href
								);
								// console.log(room);
								this.rooms.push(room);
							}
						}
					}
				})
				.then(() => {
					let promises: any = [];
					this.addressSetter();
					for (let address in this.addresses) {
						promises.push(this.geolocationGetter(address));
					}
					return Promise.all(promises).then((object: any[]) => {
						this.geolocationSetter(object);
					});
				});
		} catch (err) {
			return Promise.reject(new InsightError("failed to add :("));
		}
	}

	public campusTBodyFinder(node: any) {
		if (node !== undefined && node.childNodes !== undefined) {
			for (let childNode of node.childNodes) {
				// console.log(childNode.nodeName);
				if (childNode.nodeName.includes("tbody")) {
					this.campusBody = childNode;
				} else {
					// console.log("recursion");
					this.campusTBodyFinder(childNode);
				}
			}
		}
	}

	public campusDetailsGetter() {
		let campusDetails = [];
		for (let bodyNode of this.campusBody.childNodes) {
			if (bodyNode.nodeName === "tr") {
				let tr = bodyNode,
					roomNumber: any,
					roomCapacity: any,
					roomFurniture: any,
					roomHref: any,
					roomType: any;
				for (let node of tr.childNodes) {
					if (node.nodeName !== "td") {
						continue;
					}
					if (node.attrs[0].value.includes("number")) {
						roomHref = node.childNodes[1].attrs[0].value;
						roomNumber = node.childNodes[1].childNodes[0].value;
					} else if (node.attrs[0].value.includes("capacity")) {
						roomCapacity = node.childNodes[0].value.trim();
					} else if (node.attrs[0].value.includes("furniture")) {
						roomFurniture = node.childNodes[0].value.trim();
					} else if (node.attrs[0].value.includes("type")) {
						roomType = node.childNodes[0].value.trim();
					}
				}
				if (roomHref && roomNumber && roomCapacity && roomFurniture && roomType) {
					let building = {
						href: roomHref,
						number: roomNumber,
						capacity: parseInt(roomCapacity, 10),
						furniture: roomFurniture,
						type: roomType,
					};
					campusDetails.push(building);
				}
			}
		}
		return campusDetails;
	}

	private async addressSetter(): Promise<void> {
		for (let room of this.rooms) {
			if (!(room.rooms_address in this.addresses)) {
				// console.log(this.addresses);
				let address = room.rooms_address;
				this.addresses[address] = null;
			}
		}
	}

	public async geolocationGetter(address: string): Promise<any> {
		let addy = address.replace(/\s+/g, "%20");
		let endpoint = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team035/" + addy;
		return new Promise((resolve, reject) => {
			http.get(endpoint, (result: http.IncomingMessage) => {
				let data = "";
				result.on("data", (piece) => {
					data += piece;
				});
				result.on("end", () => {
					let res = JSON.parse(data);
					return resolve({
						lat: res.lat,
						lon: res.lon,
					});
				});
				result.on("error", () => {
					return Promise.reject(new InsightError("Failed to get geolocation"));
				});
			});
		});
	}

	private async geolocationSetter(object: any[]): Promise<void> {
		const addresses = Object.keys(this.addresses);
		for (let i = 0; i < addresses.length; i++) {
			let key = addresses[i];
			// console.log(key);
			this.addresses[key] = object[i];
		}
		await Promise.all(
			this.rooms.map(async (room) => {
				let {lat, lon} = this.addresses[room.rooms_address];
				room.rooms_lat = lat;
				room.rooms_lon = lon;
			})
		);
	}
}
