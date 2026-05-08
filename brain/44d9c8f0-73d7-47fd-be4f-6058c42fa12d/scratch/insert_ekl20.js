const supabaseUrl = 'https://vbbeibweeavuksmvkbnb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmVpYndlZWF2dWtzbXZrYm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTI2NDksImV4cCI6MjA5MzU4ODY0OX0.bkP7oDsg2jHMwNJAJG8KUzE4e725-6_uZnpd3OYiHtM'

async function insertEKL20() {
  try {
    // 1. Insert product
    const product = {
      name: 'EKL 20 kVA (3 Cyl) DG Set',
      slug: 'ekl-20-3cyl',
      model: 'EKL20(3cyl)-IV',
      kva: 20,
      engine_brand: 'Escorts',
      status: 'published',
      type: 'silent',
      category_id: 'fc4d75be-ea3b-4682-a7f9-24c1f416144e'
    };

    console.log('Inserting product...');
    const pRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(product)
    });

    if (!pRes.ok) {
      console.error('Product insertion failed:', await pRes.text());
      return;
    }

    const pData = await pRes.json();
    const productId = pData[0].id;
    console.log('Product inserted with ID:', productId);

    // 2. Insert primary media
    const media = [
      {
        product_id: productId,
        kind: 'primary',
        public_url: 'https://vbbeibweeavuksmvkbnb.supabase.co/storage/v1/object/public/products/escort_20kva_1.jpg',
        display_order: 0
      }
    ];

    console.log('Inserting media...');
    const mRes = await fetch(`${supabaseUrl}/rest/v1/product_media`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(media)
    });

    if (!mRes.ok) console.error('Media insertion failed:', await mRes.text());
    else console.log('Media inserted.');

    // 3. Insert core specs for category filters
    const specs = [
      { product_id: productId, spec_label: 'Application', spec_value: 'Prime Power', display_order: 0 },
      { product_id: productId, spec_label: 'Fuel Consumption (100% Load)', spec_value: '4.17 L/hr', display_order: 1 },
      { product_id: productId, spec_label: 'Noise Level', spec_value: '70 dB(A)', display_order: 2 },
      { product_id: productId, spec_label: 'Compliance', spec_value: 'CPCB IV+', display_order: 3 }
    ];

    console.log('Inserting specs...');
    const sRes = await fetch(`${supabaseUrl}/rest/v1/product_specs`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(specs)
    });

    if (!sRes.ok) console.error('Specs insertion error:', await sRes.text());
    else console.log('Specs inserted.');

    console.log('--- EKL 20 (3 Cyl) Inserted successfully ---');

  } catch (err) {
    console.error('Error during insertion:', err);
  }
}

insertEKL20();
