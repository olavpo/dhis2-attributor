const fs = require("fs");
const inquirer = require("inquirer");

run();

async function run() {
	let {metadataFilePath, attributeFilePath, attributeId} = filePath();
	if (!metadataFilePath) return;
		
    let metadata = readJsonFile(metadataFilePath);
    let attributeMap = readCsvFile(attributeFilePath);
    if (!metadata) return;
    
    var relevantTypes = await promptMetadataTypes(metadata);

    addAttributes(metadata, relevantTypes, attributeMap, attributeId);
    
	saveFile(metadata, saveFilePath(metadataFilePath));
}

/** CLI */
async function promptMetadataTypes(metadata) {
    var allTypes = Object.keys(metadata)
	var prompt = [
		{
			type: "checkbox",
			name: "types",
			message: "Metadata types for which to add attributes:",
			choices: allTypes
		}
	];
    let {types} = await inquirer.prompt(prompt);
    return types;
}

/** METADATA OPERATIONS */
function addAttributes(metadata, metadataTypes, attributeMap, attributeId) {
    for (let type of metadataTypes) {
        if (!Array.isArray(metadata[type])) continue;
        for (let object of metadata[type]) {
            if (attributeMap.hasOwnProperty(object.id)) {
                addUpdateAttributeValues(object, attributeId, attributeMap[object.id]);
            }
        }
    }
}

function addUpdateAttributeValues(object, attributeId, attributeValue) {
    if (object.hasOwnProperty("attributeValues")) {
        var exists = false;
        for (let attribute of object.attributeValues) {
            if (attribute.attribute.id == attributeId) {
                exists = true;
                attribute.value = attributeValue;
            }
        }
        if (!exists) {
            object.attributeValues.push(
                {
                    "value": attributeValue,
                    "attribute": {
                        "id": attributeId
                    }
                }
            );
        }
    }
    else {
        object.attributeValues = [
            {
                "value": attributeValue,
                "attribute": {
                    "id": attributeId
                }
            }
        ];
    }
}

/** FILE OPERATIONS */
function filePath() {
	if (process.argv.length == 5) {
        var metadataFilePath = process.argv[2];
        var attributeFilePath = process.argv[3];
        var attributeId = process.argv[4];
	}
	else {
		console.log("Required arguments not specified. Usage: node app.js [metadata file] [attribute list] [attribute ID]");
		console.log("node app.js metadata.json attributelist.csv Hjd827dKKds2");
		return false;
	}
	if (fs.existsSync(metadataFilePath) && fs.existsSync(attributeFilePath) && attributeId.length == 11) {
		return {
            "metadataFilePath": metadataFilePath,
            "attributeFilePath": attributeFilePath,
            "attributeId": attributeId
        };
	}
	else {
		console.log("The specified files do not exist, or attribute UID is not valid.");
		return false;
	}
}

function saveFilePath(filePath) {
	return filePath.replace(".json", "_out.json");
}


function readJsonFile(filePath) {
	let fileContent = fs.readFileSync(filePath);
	let metadata;
	try {
		metadata = JSON.parse(fileContent);
	} catch (error) {
		console.log("Problem parsing JSON:");
		console.log(error);
		return false;
	}
	return metadata;
}

function readCsvFile(filePath) {
	let fileContent = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
    let attributes = {};
    
    var lineNumber = 0, invalidFile = true;
    for (let line of fileContent) {
        if (lineNumber++ > 0) {
            let ids = line.split(",");
            if (ids.length != 2 || ids[0].length != 11 || ids[1].length != 11) {
                console.log("Line " + lineNumber + " has invalid format");
            }
            else {
                invalidFile = false;
                attributes[ids[0]] = ids[1];
            }
        }
    }
	
	return invalidFile ? false : attributes;
}

function saveFile(metadata, filePath) {
	try {
		fs.writeFileSync(filePath, JSON.stringify(metadata, null, 4));
		console.log("Metadata with swapped translations save to " + filePath);
	} catch (error) {
		console.log("Error saving swapped metadata file.");
		console.log(error);
	}
}


/** UTILITIES */

