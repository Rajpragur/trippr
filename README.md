# Trippr - AI-Powered Travel Itinerary Generator

Trippr is a Node.js application that generates optimized travel itineraries using AI. It automatically creates multi-day travel plans with tourist attractions, optimal route planning, and booking links.

## Features

- Generate detailed travel itineraries for any destination
- Specify the number of days for your trip
- Get optimized routes using the Traveling Salesman Problem algorithm
- Receive hotel and flight booking links
- Get detailed information about each attraction including:
  - Exact location (latitude/longitude)
  - Travel costs
  - Ratings
  - Descriptions
  - Images

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your API keys:
   ```
   RAPID_API_KEY=your_rapid_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Usage

1. Start the server:
   ```
   node app.js
   ```

2. Generate an itinerary:
   ```
   curl -X POST http://localhost:3000/generate-itinerary \
     -H "Content-Type: application/json" \
     -d '{"place": "Paris", "days": 3}'
   ```

## Example Response

```
Total places: 12, Path length: 12
1. Eiffel Tower - Cost: 500 INR, Distance: 0, Worth going to: 9.5/10
   Description: Iconic iron lattice tower offering breathtaking views of Paris...
2. Musée d'Orsay - Cost: 400 INR, Distance: 1.8, Worth going to: 9.1/10
   Description: Famous museum housing impressive Impressionist and Post-Impressionist art...
...
```

## API Endpoints

- `GET /` - Check if the service is running
- `POST /submit` - Submit generic data
- `POST /generate-itinerary` - Generate a travel itinerary

## Technologies Used

- Node.js
- Express
- OpenRouter AI API
- RapidAPI (Booking.com and SkyScanner)
- Dynamic Programming TSP algorithm

## License

MIT