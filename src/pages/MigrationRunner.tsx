/**
 * Migration Runner Page
 * Admin page to run database migrations
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, Database, Upload } from "lucide-react"
import { migrateEKL15ToSupabase, fetchEKL15FromSupabase } from "@/lib/migrations/migrateEKL15"

type MigrationStatus = "idle" | "running" | "success" | "error"

export default function MigrationRunner() {
  const [status, setStatus] = useState<MigrationStatus>("idle")
  const [message, setMessage] = useState<string>("")
  const [productId, setProductId] = useState<string>("")

  const runMigration = async () => {
    setStatus("running")
    setMessage("Starting EKL 15 migration...")
    
    try {
      const product = await migrateEKL15ToSupabase()
      
      if (product) {
        setStatus("success")
        setProductId(product.id)
        setMessage(`✅ Migration completed successfully! Product ID: ${product.id}`)
      } else {
        setStatus("error")
        setMessage("❌ Migration failed - no product returned")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(`❌ Migration failed: ${error.message || error}`)
      console.error("Migration error:", error)
    }
  }

  const testFetch = async () => {
    setStatus("running")
    setMessage("Fetching EKL 15 from database...")
    
    try {
      const data = await fetchEKL15FromSupabase()
      
      if (data) {
        setStatus("success")
        setMessage(`✅ Successfully fetched EKL 15 data!\n\nProduct: ${data.product.name}\nShowcase sections: ${data.showcase?.sections?.length || 0}\nPresentation hotspots: ${data.presentation?.hotspots?.length || 0}`)
      } else {
        setStatus("error")
        setMessage("❌ No data found for EKL 15")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(`❌ Fetch failed: ${error.message || error}`)
      console.error("Fetch error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Database Migration Runner</h1>
          <p className="text-gray-600">
            Run migrations to populate Supabase with product data
          </p>
        </div>

        {/* EKL 15 Migration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              EKL 15 (2 Cyl) Migration
            </CardTitle>
            <CardDescription>
              Migrate the EKL 15 kVA product to Supabase. This will insert:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Product record with basic info</li>
                <li>Product media (card image)</li>
                <li>Product specifications (~60 specs)</li>
                <li>Showcase data (10 sections) in CMS</li>
                <li>Presentation mode data (10 hotspots) in CMS</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={runMigration}
                disabled={status === "running"}
                className="flex items-center gap-2"
              >
                {status === "running" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Run Migration
                  </>
                )}
              </Button>

              <Button
                onClick={testFetch}
                disabled={status === "running"}
                variant="outline"
                className="flex items-center gap-2"
              >
                {status === "running" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Test Fetch
                  </>
                )}
              </Button>
            </div>

            {/* Status Alert */}
            {status !== "idle" && (
              <Alert variant={status === "error" ? "destructive" : "default"}>
                {status === "success" && <CheckCircle2 className="h-4 w-4" />}
                {status === "error" && <XCircle className="h-4 w-4" />}
                {status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
                <AlertTitle>
                  {status === "success" && "Success"}
                  {status === "error" && "Error"}
                  {status === "running" && "Running"}
                </AlertTitle>
                <AlertDescription className="whitespace-pre-wrap font-mono text-sm">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {productId && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Product ID:</p>
                <code className="text-xs text-blue-700">{productId}</code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Before running migrations:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></li>
                <li>Copy your project URL and anon key</li>
                <li>Add them to your <code className="bg-gray-100 px-1 rounded">.env</code> file:
                  <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                  </pre>
                </li>
                <li>Run the schema SQL from <code className="bg-gray-100 px-1 rounded">supabase-schema.sql</code> in your Supabase SQL Editor</li>
                <li>Restart your dev server to load the new environment variables</li>
                <li>Click "Run Migration" above</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">After successful migration:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Use "Test Fetch" to verify the data was inserted correctly</li>
                <li>Check your Supabase dashboard to see the data</li>
                <li>Update frontend components to fetch from Supabase</li>
                <li>Use EKL 15 as template for other Escorts products</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Template System Info */}
        <Card>
          <CardHeader>
            <CardTitle>EKL 15 Template System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              The EKL 15 (2 Cyl) serves as the <strong>standard template</strong> for all Escorts products.
            </p>
            <p>
              When adding new Escorts products, only the <strong>content changes</strong> — the structure, 
              design, and format remain the same:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Same 10-chapter showcase structure</li>
              <li>Same presentation mode with 10 hotspots</li>
              <li>Same spec categories and layout</li>
              <li>Only values change (kVA, engine model, dimensions, etc.)</li>
            </ul>
            <p className="mt-3">
              See <code className="bg-gray-100 px-1 rounded">src/lib/templates/escortsProductTemplate.ts</code> for the template interface.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
