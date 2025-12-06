const https = require('https');

exports.getNavigationRoute = async (req, res) => {
    const { start, end } = req.query;

    // Validation: Ensure the frontend sent both points
    if (!start || !end) {
        return res.status(400).json({ 
            error: "Missing coordinates. Format: ?start=lon,lat&end=lon,lat" 
        });
    }

    // Build OSRM URL
    const baseUrl = "https://router.project-osrm.org/route/v1/driving";
    const url = `${baseUrl}/${start};${end}?overview=full&steps=true&geometries=geojson`;

    console.log(`Requesting route from ${start} to ${end}...`);

    https.get(url, (apiRes) => {
        let data = '';

        apiRes.on('data', chunk => data += chunk);

        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);

                // Handle OSRM errors (e.g., points in the ocean)
                if (json.code !== 'Ok') {
                    return res.status(422).json({ error: "OSRM could not find a route.", details: json.code });
                }

                // 3. Construct GeoJSON for the Frontend
                const route = json.routes[0];
                const geoJsonOutput = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {
                                "distance_km": (route.distance / 1000).toFixed(2),
                                "duration_min": (route.duration / 60).toFixed(0),
                                "steps": route.legs[0].steps // Turn-by-turn instructions
                            },
                            "geometry": route.geometry
                        }
                    ]
                };

                // Send the JSON back to the frontend
                res.json(geoJsonOutput);

            } catch (error) {
                console.error("Parsing Error:", error);
                res.status(500).json({ error: "Failed to parse OSRM data" });
            }
        });

    }).on('error', (err) => {
        console.error("Network Error:", err.message);
        res.status(500).json({ error: "External API request failed" });
    });
}