
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vbbeibweeavuksmvkbnb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiYmVpYndlZWF2dWtzbXZrYm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTI2NDksImV4cCI6MjA5MzU4ODY0OX0.bkP7oDsg2jHMwNJAJG8KUzE4e725-6_uZnpd3OYiHtM'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

async function checkProduct() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, status')
      .eq('slug', 'ekl-15-2cyl')
      .maybeSingle()

    if (error) {
      console.error('Error:', error)
    } else {
      console.log('PRODUCT_CHECK_RESULT:', JSON.stringify(data))
    }
  } catch (e) {
    console.error('Exception:', e)
  }
}

checkProduct()
