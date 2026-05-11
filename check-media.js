import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vbbeibweeavuksmvkbnb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmVpYndlZWF2dWtzbXZrYm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTI2NDksImV4cCI6MjA5MzU4ODY0OX0.bkP7oDsg2jHMwNJAJG8KUzE4e725-6_uZnpd3OYiHtM'
)

async function checkMedia() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, product_media(*)')
    .eq('status', 'published')

  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}

checkMedia()
