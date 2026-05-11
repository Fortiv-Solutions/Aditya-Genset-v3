const fs = require('fs');
for (const file of ['src/data/products.ts', 'src/data/ekl15Data.ts', 'src/data/ekl20Data.ts']) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import.*?['"].*?(png|jpg|jpeg|mp4|svg)['"];?/g, '');
    fs.writeFileSync(file, content);
  }
}
console.log('Cleaned');
