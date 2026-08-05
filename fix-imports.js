const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles('./src');
let replacedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, 'from "@/lib/')
        .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/lib\//g, 'from "@/lib/')
        .replace(/from\s+['"]\.\.\/\.\.\/lib\//g, 'from "@/lib/')
        
        .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/components\//g, 'from "@/components/')
        .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/components\//g, 'from "@/components/')
        .replace(/from\s+['"]\.\.\/\.\.\/components\//g, 'from "@/components/')
        
        .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/mock\//g, 'from "../../../mock/')
        
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        replacedCount++;
        console.log('Fixed', file);
    }
});
console.log('Total fixed:', replacedCount);
