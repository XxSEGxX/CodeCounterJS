const fs = require('fs');
const os = require('os');
const path = require('path');

function hasParam(param) {
    return process.argv.indexOf(param)!=-1;
}

if (hasParam('-h') || hasParam('--help')) {
    console.log(
`Usage: node . [options]

Options:
  -e, --extensions              Filters files by the given extensions
                                (Separate them with ',')
  -d, --directory               Specifies the directory where the files
                                are located
  -h, --help                    Print the options`
    );
    process.exit();
}

function getParam(param) {
    var index = process.argv.indexOf(param);
    if (index == -1) {
        return undefined;
    }
    let value = process.argv[index+1];
    if (value.startsWith('-')) {
        return undefined;
    }
    return value;
}

let dir = getParam('-d');

if (!dir) {
    dir = getParam('--directory');
    if (!dir) {
        console.log('Specify an directory using -d or --directory');
        process.exit();
    }
}

let extensions = getParam('-e');

if (!extensions) {
    extensions = getParam('--extensions');
}

let customExtensions = Boolean(extensions);
if (extensions) {
    extensions = extensions.split(',');
}

if (!fs.existsSync(dir) || !isFolder(dir)) {
    console.log('That directory doesn\'t exists');
    process.exit();
}

let lines = 0;

function isFolder(dir) {
    return fs.lstatSync(dir).isDirectory();
}

function removeMainDir(secondDir) {
    return secondDir.replace(dir, '');
}

function readFolder(dir) {
    console.log(`Opening folder ${removeMainDir(dir)}`);
    let files = fs.readdirSync(dir);
    for (let i in files) {
        let fileDir = path.join(dir, files[i]);
        if (isFolder(fileDir)) {
            readFolder(fileDir);
            continue;
        }
        if (!hasValidExtension(fileDir)) {
            continue;
        }
        console.log(`Reading file ${removeMainDir(fileDir)}`);
        let fileLines = readFile(fileDir);
        console.log(`${fileLines} lines has been added`);
        lines += fileLines;
        console.log(`${lines} lines in total`);
    }
}

function readFile(dir) {
    let file = fs.readFileSync(dir, 'UTF-8');
    let lines = file.split('\n');
    return lines.length;
}

function hasValidExtension(dir) {
    if (!customExtensions) {
        return true;
    }
    for (let i in extensions) {
        if (dir.endsWith(extensions[i])) {
            return true;
        }
    }
    return false;
}

console.log(`Initial dir ${dir}`);
readFolder(dir);
console.log(`The files contain ${lines} lines`);
