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

const providerFiles = getAllFiles('./src/lib/providers');
providerFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/from ['"]\.\.\/\.\.\/types\//g, 'from "../types/');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Fixed types import in', file);
    }
});

const pageFiles = getAllFiles('./src/app');
pageFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix route.ts params
    if (file.includes('route.ts')) {
        content = content.replace(
            /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*slug:\s*string\s*\}\s*\}/g,
            '{ params }: { params: Promise<{ slug: string }> }'
        );
        content = content.replace(
            /const\s*\{\s*slug\s*\}\s*=\s*params;/g,
            'const { slug } = await params;'
        );
    } 
    // Fix page.tsx params
    else if (file.includes('page.tsx')) {
        content = content.replace(
            /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*slug:\s*string\s*\}\s*\}/g,
            '{ params }: { params: Promise<{ slug: string }> }'
        );
        content = content.replace(
            /const\s*category\s*=\s*await\s*categoryRepository\.getBySlug\(params\.slug\);/g,
            'const { slug } = await params;\n  const category = await categoryRepository.getBySlug(slug);'
        );
        content = content.replace(
            /const\s*products\s*=\s*await\s*productRepository\.getByCategory\(params\.slug\);/g,
            'const products = await productRepository.getByCategory(slug);'
        );
        content = content.replace(
            /const\s*product\s*=\s*await\s*productRepository\.getBySlug\(params\.slug\);/g,
            'const { slug } = await params;\n  const product = await productRepository.getBySlug(slug);'
        );
        content = content.replace(
            /const\s*post\s*=\s*await\s*blogRepository\.getBySlug\(params\.slug\);/g,
            'const { slug } = await params;\n  const post = await blogRepository.getBySlug(slug);'
        );
        content = content.replace(
            /productRepository\.getByRelated\(params\.slug,\s*3\);/g,
            'productRepository.getByRelated(slug, 3);'
        );
        
        // Also fix generateMetadata
        content = content.replace(
            /generateMetadata\(\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*slug:\s*string\s*\}\s*\}\)/g,
            'async generateMetadata({ params }: { params: Promise<{ slug: string }> })'
        );
        content = content.replace(
            /const\s*category\s*=\s*await\s*categoryRepository\.getBySlug\(params\.slug\);/g,
            'const { slug } = await params;\n  const category = await categoryRepository.getBySlug(slug);'
        );
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed Next.js 15 params in', file);
    }
});
