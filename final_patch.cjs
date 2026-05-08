const fs = require('fs');
const file = 'src/pages/admin/AddProduct.tsx';
let content = fs.readFileSync(file, 'utf8');

const lines = content.split(/\r?\n/);

const startIdx = lines.findIndex(l => l.includes('const extractedSpecs: SpecRow[] = [];'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('setSpecs(extractedSpecs);')) + 2;

if (startIdx >= 0 && endIdx > startIdx) {
  const newLogic = `    setSpecs((current) => {
      const next = [...current];
      
      const updateLabel = (searchString, newValue) => {
        if (!newValue || newValue.trim() === "") return;
        const index = next.findIndex(s => s.label.toLowerCase().includes(searchString.toLowerCase()));
        if (index >= 0) {
          next[index].value = newValue;
        } else {
          next.push({ label: searchString, value: newValue });
        }
      };

      updateLabel("Power Output", data.kva ? \`\${data.kva} kVA\` : null);
      updateLabel("Engine Make", data.engineModel ? \`\${inferredBrand === "other" ? "" : inferredBrand} \${data.engineModel}\`.trim() : null);
      updateLabel("Alternator Brand", data.alternatorBrand);
      updateLabel("Frequency", data.frequency);
      updateLabel("Voltage Output", data.voltage);
      updateLabel("Fuel Consumption", data.fuelConsumption);
      updateLabel("Noise Level", data.noiseLevel);
      updateLabel("Dimensions", data.dimensions);
      updateLabel("Dry Weight", data.dryWeight);
      updateLabel("CPCB Compliance", data.cpcb === 'ii' ? 'CPCB II' : 'CPCB IV+');
      
      if (data.application) updateLabel("Application", data.application);
      if (data.fuelTankCapacity) updateLabel("Fuel Tank Capacity", data.fuelTankCapacity);
      if (data.phase) updateLabel("Phase", data.phase);
      if (data.powerFactor) updateLabel("Power Factor", data.powerFactor);
      if (data.coolingType) updateLabel("Cooling", data.coolingType);
      if (data.controllerModel) updateLabel("Controller", data.controllerModel);
      
      if (data.specs?.length) {
        data.specs.forEach(spec => updateLabel(spec.label, spec.value));
      }

      return next;
    });

    if (data.advancedSections && data.advancedSections.length > 0) {
      setAdvancedSections(data.advancedSections);
    }`;

  lines.splice(startIdx, endIdx - startIdx, newLogic);
  fs.writeFileSync(file, lines.join('\n'));
  console.log('SUCCESS!');
} else {
  console.log('FAILED TO FIND INDICES');
}
