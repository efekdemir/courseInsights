// document.getElementById("click-me-button").addEventListener("click", handleClickMe);
const datasetButton = document.getElementById("dataset_button");
datasetButton.addEventListener("click", handleSelecter);

const queryButton = document.getElementById('query_button');
queryButton.addEventListener("click", handlePOST);

// function handleClickMe() {
// 	alert("Button Clicked!");
// }
let selectedDataset = "";
let selectedDatasetSpan = document.getElementById("selected_dataset");

async function handleSelecter() {
	event.preventDefault();
	let selection = document.getElementById("dataset").value;
	if (selection) {
		selectedDataset = selection;
		selectedDatasetSpan.textContent = selectedDataset;
		alert("Dataset selected: " + selectedDataset);
		document.getElementById("success1").innerHTML = "Successfully selected dataset " + selectedDataset;
		document.getElementById("failure1").innerHTML = "";
	} else {
		alert("Please select a valid dataset");
		document.getElementById("failure1").innerHTML = "Invalid dataset";
		document.getElementById("success1").innerHTML = "";
	}
}
async function handlePOST() {
	event.preventDefault();
	let selection = selectedDataset;
	// console.log(selection + "hello");
	let input = document.getElementById("avg").value;
	let inputNumber = Number(input);
	let dept = selection + "_title";
	let average = selection + "_avg";
	// console.info(inputNumber);
	let query = {
		WHERE: {
			GT: {
				[average]: inputNumber
			}
		},
		OPTIONS: {
			COLUMNS: [
				dept,
				average
			],
			ORDER: average
		}
	};
	console.log(JSON.stringify(query));
	let request = await fetch("http://localhost:4321/query", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(query)
	});
	let status = request.status;
	let response = await request.json();
	if (status === 200) {
		let string = JSON.stringify(response.result, null, 4);
		if (response.result.length !== 0) {
			alert("We found these:");
			document.getElementById("success2").innerHTML = string;
			document.getElementById("failure2").innerHTML = "";
		} else {
			alert("No grade boosters found");
			document.getElementById("success2").innerHTML = "";
			document.getElementById("failure2").innerHTML = "Failed to acquire results, try inputting a " +
				"different number or dataset";
		}
	}
	if (status === 400) {
		console.error(JSON.stringify(query));
		alert("Failed to perform query");
		document.getElementById("failure2").innerHTML = "Failed to acquire results, try inputting a " +
			"different number or dataset";
		document.getElementById("success2").innerHTML = "";
	}
}
