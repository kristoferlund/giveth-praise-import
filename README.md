# Giveth Praise import

This script takes the csv exports from the old Praise bot and coverts it into a format that can be imported into the new Praise system.

## Usage

```bash
$ npm install
$ node index.js
```

## Input

The script expects csv files in the root folder of the project.

## Output

The script will output a file called `import.json` in the output folder of the project. Script also outputs files listing items that failed to process as well as missing users and channels.
