$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
} catch {
    Write-Host "Failed to bind 8080, trying 8085..."
    $port = 8085
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")
    $listener.Start()
}

Write-Host ">>> Web Server listening on http://localhost:$port/ and http://127.0.0.1:$port/ <<<"
$baseDir = "c:\Users\Administrator\Desktop\vibe\food"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
        Write-Host "Request: $($request.HttpMethod) $rawPath"

        # favicon.ico 빈 응답
        if ($rawPath -eq "/favicon.ico") {
            $response.StatusCode = 200
            $response.ContentType = "image/x-icon"
            $response.ContentLength64 = 0
            $response.Close()
            continue
        }

        if ($rawPath -eq "/" -or $rawPath -eq "" -or [string]::IsNullOrWhiteSpace($rawPath)) {
            $rawPath = "/index.html"
        }

        $relPath = $rawPath.TrimStart('/').Replace('/', '\')
        $localPath = Join-Path $baseDir $relPath

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                Default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  -> 200 OK ($($bytes.Length) bytes)"
        } else {
            Write-Host "  -> 404 NOT FOUND: $localPath"
            $response.StatusCode = 404
            $html404 = "<html><body><h1>404 Not Found</h1><p>Requested: $rawPath</p><p><a href='/index.html'>Go to Home</a></p></body></html>"
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes($html404)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
