# DHIS2 Attributor
Tool for adding attribute values to objects in DHIS2 metadata files.

## Installation
`npm install`

## Use
Three input arguments are required:

- path to a metadata file, which contains the metadata to which to add the attributes
- path to a csv file with two columns: UID of the metadata object, and attribute value to be added
- the UID of the attribute

Example:
`node app.js metadata.json attributelist.csv Hjd827dKKds2`

The result will be written to a file postfixed \_out, for example `metadata_out.json`
