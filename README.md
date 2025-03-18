Trippr Backend
This is the backend for Trippr, a CS1201 project developed by Raj Pratap Singh Gurjar and Tejeshwar under the guidance of Prof. Jimson Mathew.

Trippr is a travel itinerary generator that uses open-source LLM models to recommend the top X places to visit over Y days in a given location Z (where Y and Z are user inputs, and X is determined based on the input days).

🚀 Project Overview
✅ Core Idea
Trippr generates a personalized travel itinerary by:

Using Node.js and Express.js for backend development.

Fetching data from an LLM model via the OpenRouter API using the mistralai/mistral-7b-instruct-free model.

Returning structured JSON data containing:

Name of the place
Latitude and Longitude (accurate to 100 meters)
Estimated travel cost (in INR)
Rating (based on popularity, uniqueness, and user reviews)
Hotel booking links
Flight booking links
High-quality images
Building a weighted graph where:

Each node = A place of interest
Each edge = Distance (used as weight)
Applying Dijkstra's algorithm to compute the shortest path between the places, optimizing the itinerary.

Providing hotel and flight booking options directly from the generated itinerary.

🔥 Features
✅ Personalized travel suggestions based on user inputs.
✅ Uses open-source LLM models to ensure scalability and adaptability.
✅ JSON-based structured response for easy parsing and frontend integration.
✅ Optimal travel path calculated using Dijkstra's Algorithm.
✅ Hotel and flight booking links included in the itinerary.

🏗️ Tech Stack
Technology	Description
Node.js	JavaScript runtime environment
Express.js	Web framework for Node.js
OpenRouter API	API service for LLM model integration
Mistral-7b-instruct-free	Open-source LLM model used for data generation
Graph-based Optimization	Dijkstra's algorithm for shortest path calculation
Booking Integration	Hotel and flight booking links using Goibibo, Skyscanner, etc.
📂 Project Structure
bash
Copy
Edit
trippr-backend/
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── app.js
├── routes/
│   ├── itinerary.js
├── controllers/
│   ├── itineraryController.js
└── README.md
🛠️ Setup and Installation
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/trippr-backend.git
2. Install Dependencies
bash
Copy
Edit
cd trippr-backend
npm install
3. Add .env File
Create a .env file and add your OpenRouter API Key:

ini
Copy
Edit
OPENROUTER_API_KEY=your-openrouter-api-key
4. Start the Server
bash
Copy
Edit
npm start
5. Test the API
You can use Postman or cURL to test the endpoint:

bash
Copy
Edit
curl -X POST http://localhost:3000/generate-itinerary \
-H "Content-Type: application/json" \
-d '{
    "place": "Shimla",
    "days": 3
}'
🏆 Sample API Response
Example response from the LLM model:

json
Copy
Edit
{
  "city": "Shimla",
  "days": 3,
  "places": [
    {
      "name": "Mall Road",
      "location": {
        "latitude": 31.074444,
        "longitude": 77.052778
      },
      "travel_cost": {
        "to_next": "50 INR",
        "currency": "INR"
      },
      "hotel_links": [
        "https://hotel1.com",
        "https://hotel2.com"
      ],
      "flight_links": [
        "https://flight1.com",
        "https://flight2.com"
      ],
      "rating": 8,
      "images": [
        "https://mallroad1.jpg",
        "https://mallroad2.jpg"
      ]
    }
  ]
}
🧠 How It Works
The user sends a POST request to /generate-itinerary with the following fields:

place → City name (e.g., "Shimla")
days → Number of days (e.g., 3)
The backend sends the request to the OpenRouter API using the Mistral-7b-instruct-free model.

The model generates and returns structured JSON data.

The backend parses the data, builds a weighted graph, and calculates the shortest travel path using Dijkstra's Algorithm.

The backend returns a structured itinerary in JSON format to the client.

🚧 Current Limitations
⚠️ Flight and hotel links are dependent on real-time data availability.
⚠️ Graph-based pathfinding might slow down with a very high number of places.

📌 Future Enhancements
✅ Add user authentication and saved trips feature.
✅ Improve rating algorithm based on real user feedback.
✅ Expand to more cities and cross-country itineraries.

🏅 Contributors
Raj Pratap Singh Gurjar – Backend, API Integration, Graph Optimization
Tejeshwar – Frontend, UI/UX, Testing
🎯 License
This project is licensed under the MIT License – feel free to modify and use!
