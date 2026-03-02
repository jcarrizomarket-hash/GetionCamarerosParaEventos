import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Package } from 'lucide-react';

const GITHUB_API_URL =
  'https://api.github.com/repos/jcarrizomarket-hash/GetionCamarerosParaEventos/contents/package.json?ref=main';

export function PackageInfo() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageJson = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GITHUB_API_URL, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      let decoded: string;
      try {
        decoded = atob(data.content.replace(/\n/g, ''));
      } catch {
        throw new Error('Error al decodificar el contenido Base64 de package.json');
      }
      setContent(decoded);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackageJson();
  }, [fetchPackageJson]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          package.json (rama main)
        </CardTitle>
        <CardDescription>
          Contenido de <code>package.json</code> obtenido desde la rama <code>main</code> del repositorio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPackageJson}
          disabled={loading}
          className="mb-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {content && (
          <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto whitespace-pre-wrap">
            {content}
          </pre>
        )}

        {!content && !error && !loading && (
          <p className="text-gray-500 text-sm">Sin contenido.</p>
        )}
      </CardContent>
    </Card>
  );
}
