const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hi, Seems like Trippr is working!");
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

app.post('/api/generate-itinerary', async(req, res) => {
    console.log(req.body);
    const {place, days} = req.body;
    if(!place || !days){
        return res.status(400).json({ error: "Missing place or days Please give input correctly" });
    }
    
    try {
        location = place;
        day = days;
        const prompt = `Generate a detailed travel itinerary for the city of "${place}" for ${days} days. I need exactly ${days * 4} different tourist places (not duplicates). For each place, include complete information with name, location (latitude and longitude), travel cost, rating, and image URLs.
        
        Return the response in **pure JSON format** only — no additional text or explanations. Use the following exact JSON structure:
        {
          "Place": "${place}",
          "Days": ${days},
          "places": [
            {
              "name": "PLACE_NAME_1",
              "location": {
                "latitude": LATITUDE,
                "longitude": LONGITUDE
              },
              "travel_cost": {
                "to_next": COST TO TRAVEL OR GO TO THIS PLACE FROM CENTER OF ${place},
                "currency": "INR"
              },
              "rating": RATING_OUT_OF_10,
              "distance": DISTANCE_FROM_${place},
              "nearby": HOW TO REACH HERE, WHICH AREA IT IS IN OR WHERE IT IS,
              "images": ["IMAGE_URL_1", "IMAGE_URL_2"],
              "note" : A SHORT NOTE AROUND 300-400 CHARACTERS ABOUT THE PLACE AND WHAT TO ENJOY HERE INCLUDE SOME MUSTS AND SUGGESTIONS ON WHAT YOU MUST DO OR NOT HERE TO AVOID OR MAKE IT BETTER
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
              "distance": DISTANCE_FROM_${place},
              "nearby": HOW TO REACH HERE, WHICH AREA IT IS IN OR WHERE IT IS,
              "images": ["IMAGE_URL_1", "IMAGE_URL_2"],
              "note" : A SHORT NOTE AROUND 300-400 CHARACTERS ABOUT THE PLACE AND WHAT TO ENJOY HERE INCLUDE SOME MUSTS AND SUGGESTIONS ON WHAT YOU MUST DO OR NOT HERE TO AVOID OR MAKE IT BETTER
            },
            ... (and so on for all ${days * 4} places)
          ]
        }
        
        Ensure you include exactly ${days * 4} places in the JSON response. The places should be different tourist attractions in ${place}. Make sure to include the correct coordinates with more precision upto 100 metres for each place.
        Provide exact geographic coordinates with 6 decimal places of precision for each location. Coordinates must be accurate and correspond to the actual location of each attraction in ${place}
        Also scale the ratings overall relatively in those ${days * 4} places so the best place gets a rating 10 and other gets a rating less.`;
        console.log();
        console.log("Sending prompt to API...");
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-4-maverick:free",
                "messages": [{ "role": "user", "content": prompt }]
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
            console.log("Parsed places:", itinerary.places);
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
                        `Cost: ${itineraryData.places[idx].travel_cost.to_next} ${itineraryData.places[idx].travel_cost.currency}, ` + `Distance: ${itineraryData.places[idx].distance} km, `+
                        `Worth going to: ${itineraryData.places[idx].rating}/10` + `\n   Description: ${itineraryData.places[idx].note}\n`);
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
