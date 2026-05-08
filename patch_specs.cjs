const fs = require('fs');
const file = 'src/pages/admin/AddProduct.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `    const extractedSpecs: SpecRow[] = [];
    if (data.engineModel) extractedSpecs.push({ label: "Engine Model", value: data.engineModel });
    if (data.alternatorBrand) extractedSpecs.push({ label: "Alternator Brand", value: data.alternatorBrand });
    if (data.application) extractedSpecs.push({ label: "Application", value: data.application });
    if (data.fuelConsumption) extractedSpecs.push({ label: "Fuel Consumption", value: data.fuelConsumption });
    if (data.fuelTankCapacity) extractedSpecs.push({ label: "Fuel Tank Capacity", value: data.fuelTankCapacity });
    if (data.noiseLevel) extractedSpecs.push({ label: "Noise Level", value: data.noiseLevel });
    if (data.dimensions) extractedSpecs.push({ label: "Dimensions (LxWxH)", value: data.dimensions });
    if (data.dryWeight) extractedSpecs.push({ label: "Dry Weight", value: data.dryWeight });
    if (data.voltage) extractedSpecs.push({ label: "Voltage Output", value: data.voltage });
    if (data.frequency) extractedSpecs.push({ label: "Frequency", value: data.frequency });
    if (data.phase) extractedSpecs.push({ label: "Phase", value: data.phase });
    if (data.powerFactor) extractedSpecs.push({ label: "Power Factor", value: data.powerFactor });
    if (data.coolingType) extractedSpecs.push({ label: "Cooling", value: data.coolingType });
    if (data.controllerModel) extractedSpecs.push({ label: "Controller", value: data.controllerModel });
    if (data.specs?.length) extractedSpecs.push(...data.specs);

    if (extractedSpecs.length > 0) {
      setSpecs(extractedSpecs);
    }`;

const newLogic = `    setSpecs((current) => {
      const next = [...current];
      
      const updateLabel = (searchString: string, newValue: string | null) => {
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
    });`;

if (content.includes('const extractedSpecs: SpecRow[] = [];')) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync(file, content);
  console.log('Successfully patched AddProduct.tsx');
} else {
  console.log('Could not find target content in AddProduct.tsx');
}
