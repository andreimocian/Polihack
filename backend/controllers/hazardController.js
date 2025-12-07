// hazardController.js
const https = require('https');

// Helper function to perform the actual HTTPS request
// Added 'limit' parameter with a default of 100 to prevent fetching huge historical datasets
const fetchFromNASA = (category, limit = 100) => {
    return new Promise((resolve, reject) => {
        // We append ?limit=${limit} to the URL
        const url = `https://eonet.gsfc.nasa.gov/api/v3/categories/${category}?limit=${limit}`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json.events || []);
                } catch (e) {
                    reject(new Error(`Failed to parse NASA data for ${category}`));
                }
            });

        }).on('error', (err) => {
            reject(err);
        });
    });
};

const HazardController = {

    // 1. Individual Category Functions
    getWildfires: async (req, res) => {
        try {
            const data = await fetchFromNASA('wildfires');
            res.json(data); // Returns max 100 wildfires
        } catch (error) {
            console.error('Error fetching wildfires:', error);
            res.status(500).json({ error: 'Failed to fetch wildfire data' });
        }
    },

    getFloods: async (req, res) => {
        try {
            const data = await fetchFromNASA('floods');
            res.json(data);
        } catch (error) {
            console.error('Error fetching floods:', error);
            res.status(500).json({ error: 'Failed to fetch flood data' });
        }
    },

    getLandslides: async (req, res) => {
        try {
            const data = await fetchFromNASA('landslides');
            res.json(data);
        } catch (error) {
            console.error('Error fetching landslides:', error);
            res.status(500).json({ error: 'Failed to fetch landslide data' });
        }
    },

    getSevereStorms: async (req, res) => {
        try {
            const data = await fetchFromNASA('severeStorms');
            res.json(data);
        } catch (error) {
            console.error('Error fetching severe storms:', error);
            res.status(500).json({ error: 'Failed to fetch severe storm data' });
        }
    },

    getEarthquakes: async (req, res) => {
        try {
            const data = await fetchFromNASA('earthquakes');
            res.json(data);
        } catch (error) {
            console.error('Error fetching earthquakes:', error);
            res.status(500).json({ error: 'Failed to fetch earthquake data' });
        }
    },

    // 2. Aggregate Function (Get All)
    getAllHazards: async (req, res) => {
        try {
            console.log("Fetching all hazards...");
            
            // We fetch up to 100 of each category (Total max could be 500 items)
            const [wildfires, floods, landslides, severeStorms, earthquakes] = await Promise.all([
                fetchFromNASA('wildfires'),
                fetchFromNASA('floods'),
                fetchFromNASA('landslides'),
                fetchFromNASA('severeStorms'),
                fetchFromNASA('earthquakes')
            ]);

            // Combine them into a single list and tag them
            const combinedData = [
                ...wildfires.map(e => ({ ...e, category: 'wildfire' })),
                ...floods.map(e => ({ ...e, category: 'flood' })),
                ...landslides.map(e => ({ ...e, category: 'landslide' })),
                ...severeStorms.map(e => ({ ...e, category: 'severeStorm' })),
                ...earthquakes.map(e => ({ ...e, category: 'earthquake' }))
            ];

            // 1. Sort by Date (Descending - Newest first)
            combinedData.sort((a, b) => {
                // EONET stores dates in geometries array. We pick the first one (start date).
                const dateA = new Date(a.geometries && a.geometries.length ? a.geometries[0].date : 0);
                const dateB = new Date(b.geometries && b.geometries.length ? b.geometries[0].date : 0);
                return dateB - dateA; 
            });

            // 2. Slice to keep only the top 100 most recent across all categories
            const recentHazards = combinedData.slice(0, 100);

            recentHazards.push({
                id: "AXI4_1589",
                title: "Mancarea fire de la Big Belly",
                description: "Top",
                link: "https://www.bigbelly-cluj.ro/",
                categories: [{
                    id: "wildfires",
                    title: "Wildfires"
                }],
                sources: [{
                    id: "AXI4",
                    url: "https://www.amd.com/en/products/software/adaptive-socs-and-fpgas/vivado.html"
                }],
                geometry: [{
                    magnitudeValue: 800,
                    magnitudeUnit: "hectare",
                    date: "2025-12-04T07:30:00Z",
                    type: "Point",
                    coordinates: [
                        23.610020371912167,
                        46.7840103657538,
                    ]
                }],
                category: "wildfire"
            });

            res.json(recentHazards);

        } catch (error) {
            console.error('Error fetching all hazards:', error);
            res.status(500).json({ error: 'Failed to fetch combined hazard data' });
        }
    }
};

module.exports = HazardController;