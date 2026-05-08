const supabaseUrl = 'https://vbbeibweeavuksmvkbnb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmVpYndlZWF2dWtzbXZrYm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTI2NDksImV4cCI6MjA5MzU4ODY0OX0.bkP7oDsg2jHMwNJAJG8KUzE4e725-6_uZnpd3OYiHtM'

async function checkEKL10() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?slug=eq.ekl10-iv&select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!res.ok) {
      console.error('Fetch failed:', res.status, await res.text());
      return;
    }
    
    const data = await res.json();
    console.log('--- EKL10 details ---');
    console.log(JSON.stringify(data[0], null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkEKL10()
