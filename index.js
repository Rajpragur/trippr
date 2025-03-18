const express = require("express");
const app = express();
require('dotenv').config();

const PORT = 3000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello, Trippr is working!');
});

app.post('/submit', (req, res) => {
    console.log(req.body);
    res.json({ message: "Data received!", data: req.body });
});
app.post('/generate-itinerary', async(req, res) => {
    const {place,days} = req.body;
    if(!place || !days){
        return res.status(400).json({ error: "Missing place or days Please give input correctly" });
    }
    const prompt = `Generate a detailed travel itinerary for the city of "${place}" for ${days} days. Return ${days*4} (We assume that in a day maximum 4 places can we visited) places and Focus only on places within the city and nearby areas (within a 40 km radius). 
Return the response in **pure JSON format** only — no additional text or explanations. Use the following exact JSON structure:

{
  "city": "${place}",
  "days": ${days},
  "places": [
    {
      "name": "PLACE_NAME",
      "location": {
        "latitude": LATITUDE,
        "longitude": LONGITUDE
      },
      "travel_cost": {
        "to_next": "COST TO NEXT LOCATION",
        "currency": "INR"
      },
      "hotel_links": ["HOTEL_LINK_1", "HOTEL_LINK_2"],
      "flight_links": ["FLIGHT_LINK_1", "FLIGHT_LINK_2"],
      "rating": RATING_OUT_OF_10,
      "images": ["IMAGE_URL_1", "IMAGE_URL_2"]
    }
  ]
}
Ensure the JSON is properly formatted and complete with no missing fields. DO NOT include any additional text, comments, or markdown formatting.`;
    try{
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
        if(content){
            try {
                const itinerary = JSON.parse(content);
                res.json(itinerary);
            } catch (parseError) {
                console.error("JSON parsing error:", parseError);
                res.status(500).json({ message: "Invalid JSON response from AI" });
            }
        }
        res.json(data);
    }catch(error){
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log("It's working innit on PORT:" + PORT);
});