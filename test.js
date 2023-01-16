// Initialize the JS client
import { createClient } from '@supabase/supabase-js'
const supabase = createClient("https://ooquahxdxtxhntnmfton.supabase.co", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcXVhaHhkeHR4aG50bm1mdG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM4OTIxOTksImV4cCI6MTk4OTQ2ODE5OX0.cRhv-xKMEeiuxADXW4-06znwa4c0pafpMPgpba08ze0')

// Make a request
const { data: table1, error } = await supabase.from('table1').select('*')
