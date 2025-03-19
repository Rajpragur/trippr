const express = require("express");
const app = express();
require('dotenv').config();

const PORT = 3000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hi, Seems like Trippr is working!');
});

app.post('/submit', (req, res) => {
    console.log(req.body);
    res.json({ message: "Data received!", data: req.body });
});

let dist = function(x1,y1,x2,y2){
    return 2 * 6371 * Math.asin(Math.sqrt(Math.pow(Math.sin((x2-x1)* Math.PI / 360),2) + Math.cos(x1* Math.PI / 180)*Math.cos(x2* Math.PI / 180)*Math.pow(Math.sin((y2-y1)* Math.PI / 360),2)));
};

const INF = 1e9;

function tspDP(adjMatrix) {
    const n = adjMatrix.length;
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(INF));
    const parent = Array.from({ length: 1 << n }, () => Array(n).fill(-1));
    dp[1][0] = 0;
    for (let mask = 1; mask < (1 << n); mask++) {
        for (let u = 0; u < n; u++) {
            if ((mask & (1 << u)) === 0) continue;

            for (let v = 0; v < n; v++) {
                if ((mask & (1 << v)) !== 0) continue;

                let newMask = mask | (1 << v);
                let newCost = dp[mask][u] + adjMatrix[u][v];

                if (newCost < dp[newMask][v]) {
                    dp[newMask][v] = newCost;
                    parent[newMask][v] = u;
                }
            }
        }
    }
    let res = INF;
    let lastNode = -1;
    for (let u = 1; u < n; u++) {
        let cost = dp[(1 << n) - 1][u] + adjMatrix[u][0];
        if (cost < res) {
            res = cost;
            lastNode = u;
        }
    }

    let mask = (1 << n) - 1;
    let path = [];
    while (lastNode !== -1) {
        path.push(lastNode);
        let temp = lastNode;
        lastNode = parent[mask][lastNode];
        mask ^= (1 << temp);
    }
    path.reverse();
    return path;
}


let itineraryData = null;
let location = null;
let day = null;
let nodes = null;;

const fetchHotelLink = async (place) => {
    const encodedPlace = encodeURIComponent(place);
    const hotelUrl = `https://booking-com15.p.rapidapi.com/api/v1/attraction/getAttractionReviews?id=${encodedPlace}&page=1`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(hotelUrl, options);
        const result = await response.json();
        if (result?.data?.length > 0) {
            return result.data[0].url || null;
        }
        return null;
    } catch (error) {
        console.error("Error fetching hotel link:", error);
        return null;
    }
};


const fetchFlightLink = async (place) => {
    const encodedPlace = encodeURIComponent(place);
    const url = `https://sky-scanner3.p.rapidapi.com/cars/auto-complete?query=${encodedPlace}`;
    const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
        }
      };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result?.data?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Flight link:", error);
        return null;
    }
};

app.post('/generate-itinerary', async(req, res) => {
    const {place, days} = req.body;
    if(!place || !days){
        return res.status(400).json({ error: "Missing place or days Please give input correctly" });
    }
    
    try {
        const hotelLink = await fetchHotelLink(place);
        const flightLink = await fetchFlightLink(place);
        location = place;
        day = days;
        const prompt = `Generate a detailed travel itinerary for the city of "${place}" for ${days} days. I need exactly ${days * 4} different tourist places (not duplicates). For each place, include complete information with name, location (latitude and longitude), travel cost, rating, and image URLs.
        
        Return the response in **pure JSON format** only — no additional text or explanations. Use the following exact JSON structure:
        
        {
          "Place": "${place}",
          "Days": ${days},
          "hotel_link": "${hotelLink || 'N/A'}", 
          "flight_link": "${flightLink || 'N/A'}", 
          "places": [
            {
              "name": "PLACE_NAME_1",
              "location": {
                "latitude": LATITUDE,
                "longitude": LONGITUDE
              },
              "travel_cost": {
                "to_next": "COST TO TRAVEL OR GO TO THIS PLACE",
                "currency": "INR"
              },
              "rating": RATING_OUT_OF_10,
              "images": ["IMAGE_URL_1", "IMAGE_URL_2"]
            },
            {
              "name": "PLACE_NAME_2",
              "location": {
                "latitude": LATITUDE,
                "longitude": LONGITUDE
              },
              "travel_cost": {
                "to_next": "COST TO TRAVEL OR GO TO THIS PLACE",
                "currency": "INR"
              },
              "rating": RATING_OUT_OF_10,
              "images": ["IMAGE_URL_1", "IMAGE_URL_2"]
            },
            ... (and so on for all ${days * 4} places)
          ]
        }
        
        Ensure you include exactly ${days * 4} places in the JSON response. The places should be different tourist attractions in ${place}. Make sure to include the correct coordinates with more precision upto 100 metres for each place.`;
        console.log();
        console.log("Sending prompt to API...");
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct:free",
                messages: [{ role: "user", content: prompt }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenRouter API Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if(!content) {
            throw new Error("No content returned from AI");
        }
        try {
            const cleanedContent = content.replace(/^```json|```$/g, '').trim();

            const itinerary = JSON.parse(cleanedContent);
            
            console.log(`Number of places returned: ${itinerary.places?.length || 0}`);
            itineraryData = {
                ...itinerary,
                places: itinerary.places.reduce((acc, place) => {
                    const normalizedName = place.name.toLowerCase().trim();
                    if (!acc.some(p => {
                        const existingNormalizedName = p.name.toLowerCase().trim();
                        return existingNormalizedName === normalizedName ||
                               existingNormalizedName.includes(normalizedName) ||
                               normalizedName.includes(existingNormalizedName);
                    })) {
                        acc.push(place);
                    }
                    return acc;
                }, [])
            };
            
            nodes = itineraryData.places.length;
            console.log(`After removing duplicates: ${nodes} unique places`);
            const mat = Array.from({ length: nodes }, () => new Array(nodes).fill(0));
            for(let i = 0; i < nodes; i++) {
                for(let j = 0; j < nodes; j++) {
                    if(i != j) {
                        mat[i][j] = dist(
                            itineraryData.places[i].location.latitude,
                            itineraryData.places[i].location.longitude,
                            itineraryData.places[j].location.latitude,
                            itineraryData.places[j].location.longitude
                        );
                    }
                }
            }
            const path = tspDP(mat);
            console.log(`Optimal Path to travel in ${place} is ->`);
            console.log(`Total places: ${itineraryData.places.length}, Path length: ${path.length}`);
            for(let i = 0; i < path.length; i++) {
                const idx = path[i];
                if (idx >= 0 && idx < itineraryData.places.length) {
                    console.log(`${i+1}. ${itineraryData.places[idx].name} - ` +
                        `Cost: ${itineraryData.places[idx].travel_cost.to_next} ${itineraryData.places[idx].travel_cost.currency}, ` +
                        `Rating: ${itineraryData.places[idx].rating}/10`);
                } else {
                    console.log(`Warning: Invalid place index ${idx}`);
                }
            }
            console.log("Have a Nice Journey\n");
            res.json({
                ...itineraryData,
                optimal_path: path.map(idx => itineraryData.places[idx])
            });
            
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            res.status(500).json({ message: "Invalid JSON response from AI" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log("It's working on PORT:" + PORT);
});