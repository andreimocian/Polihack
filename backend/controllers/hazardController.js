// hazardController.js
const https = require('https');

// Helper function to perform the actual HTTPS request
// This keeps our code DRY (Don't Repeat Yourself)
const fetchFromNASA = (category) => {
    return new Promise((resolve, reject) => {
        const url = `https://eonet.gsfc.nasa.gov/api/v3/categories/${category}`;

        https.get(url, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // EONET returns an object with a 'events' array. 
                    // We only return the events to keep the response clean.
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
            res.json(data);
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
    // This fetches all 5 categories at the same time (in parallel)
    getAllHazards: async (req, res) => {
        try {
            console.log("Fetching all hazards...");
            
            // Promise.all waits for all requests to finish
            const [wildfires, floods, landslides, severeStorms, earthquakes] = await Promise.all([
                fetchFromNASA('wildfires'),
                fetchFromNASA('floods'),
                fetchFromNASA('landslides'),
                fetchFromNASA('severeStorms'),
                fetchFromNASA('earthquakes')
            ]);

            // Combine them into a single list
            // We also tag them so the frontend knows the source category
            const combinedData = [
                ...wildfires.map(e => ({ ...e, category: 'wildfire' })),
                ...floods.map(e => ({ ...e, category: 'flood' })),
                ...landslides.map(e => ({ ...e, category: 'landslide' })),
                ...severeStorms.map(e => ({ ...e, category: 'severeStorm' })),
                ...earthquakes.map(e => ({ ...e, category: 'earthquake' }))
            ];

            res.json(combinedData);

        } catch (error) {
            console.error('Error fetching all hazards:', error);
            res.status(500).json({ error: 'Failed to fetch combined hazard data' });
        }
    }
};

module.exports = HazardController;