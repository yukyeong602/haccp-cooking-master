$urls = @(
    "http://localhost:8080/",
    "http://localhost:8080/css/style.css",
    "http://localhost:8080/js/data.js",
    "http://localhost:8080/js/meatMap.js",
    "http://localhost:8080/js/game.js",
    "http://localhost:8080/js/audio.js"
)

foreach ($url in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
        Write-Host "$url -> Status: $($res.StatusCode), Length: $($res.Content.Length)"
    } catch {
        Write-Host "$url -> Error: $_"
    }
}
