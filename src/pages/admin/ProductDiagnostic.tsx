import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDiagnostic() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const { toast } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_media (id, kind, public_url),
          product_specs (id, spec_label, spec_value)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      
      toast({
        title: "Data loaded",
        description: `Found ${data?.length || 0} products in database`,
      });
    } catch (err: any) {
      toast({
        title: "Error loading data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const publishAllProducts = async () => {
    setFixing(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'published' })
        .neq('status', 'published')
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Published ${data?.length || 0} products`,
      });

      // Reload data
      await loadProducts();
    } catch (err: any) {
      toast({
        title: "Error publishing products",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  const publishProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'published' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Product published",
        description: "Product is now visible in the UI",
      });

      await loadProducts();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const publishedCount = products.filter(p => p.status === 'published').length;
  const draftCount = products.filter(p => p.status === 'draft').length;
  const archivedCount = products.filter(p => p.status === 'archived').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Diagnostic Tool</h1>
        <p className="text-muted-foreground">
          Check and fix product visibility issues
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Published (Visible)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">
              Draft (Hidden)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{draftCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Archived (Hidden)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{archivedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={loadProducts} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>

        {(draftCount > 0 || archivedCount > 0) && (
          <Button onClick={publishAllProducts} disabled={fixing}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Publish All Hidden Products ({draftCount + archivedCount})
          </Button>
        )}
      </div>

      {/* Product List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">All Products</h2>
        
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading products...</p>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No products found in database</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => {
            const hasImages = product.product_media && product.product_media.length > 0;
            const hasSpecs = product.product_specs && product.product_specs.length > 0;
            const isPublished = product.status === 'published';
            const primaryImage = product.product_media?.find((m: any) => m.kind === 'primary');

            return (
              <Card key={product.id} className={!isPublished ? 'border-orange-200 bg-orange-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3">
                        {product.name}
                        <Badge variant={isPublished ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Model: {product.model} | kVA: {product.kva} | Engine: {product.engine_brand}
                      </CardDescription>
                    </div>
                    {!isPublished && (
                      <Button 
                        size="sm" 
                        onClick={() => publishProduct(product.id)}
                      >
                        Publish Now
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {isPublished ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-orange-600" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">Visibility</div>
                        <div className="text-sm text-muted-foreground">
                          {isPublished ? 'Visible in UI' : 'Hidden from UI'}
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div className="flex items-center gap-2">
                      {hasImages ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">Images</div>
                        <div className="text-sm text-muted-foreground">
                          {product.product_media?.length || 0} images
                          {primaryImage && ' (has primary)'}
                        </div>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex items-center gap-2">
                      {hasSpecs ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">Specifications</div>
                        <div className="text-sm text-muted-foreground">
                          {product.product_specs?.length || 0} specs
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Slug:</span>
                        <div className="font-mono text-xs">{product.slug}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div>{product.type}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <div>{product.stock}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div>{new Date(product.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
