const fs = require('fs');
const file = 'src/pages/admin/AddProduct.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetString = `      if (data.specs?.length) {
        data.specs.forEach(spec => updateLabel(spec.label, spec.value));
      }

      return next;
    });`;

const replacementString = `      if (data.specs?.length) {
        data.specs.forEach(spec => updateLabel(spec.label, spec.value));
      }

      return next;
    });

    if (data.advancedSections && data.advancedSections.length > 0) {
      setAdvancedSections(data.advancedSections);
    }`;

if (content.includes(targetString)) {
  content = content.replace(targetString, replacementString);
  fs.writeFileSync(file, content);
  console.log('Successfully added setAdvancedSections to handleExtracted');
} else {
  console.log('Target string not found');
}
