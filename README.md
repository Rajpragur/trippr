# 🌍 Trippr - AI-Powered Travel Itinerary Generator

[![Node.js CI](https://github.com/yourusername/trippr/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/trippr/actions)

**Trippr** is your personal AI travel buddy that builds **multi-day travel plans** for any destination. It smartly selects top tourist attractions, computes optimized travel paths, estimates costs, and even suggests hotel/flight booking links.

---

## 🚀 Features

- 🧠 **AI-generated day-by-day travel itinerary**
- 📍 Optimized routes using **Traveling Salesman Problem (TSP)** algorithm
- 🏨 **Hotel** and ✈️ **Flight booking** links
- 📌 Each attraction includes:
  - Name + Description
  - 📍 Location (latitude/longitude)
  - ⭐ Ratings
  - 💸 Estimated cost
  - 📷 Image

---

## 📁 Project Structure

```bash
trippr/
├── public/             # Frontend (HTML, CSS, JS)
├── app.js              # Node.js backend
├── .env                # API keys
├── package.json
├── README.md

---

## INSTALLATION

### Clone the repository
- git clone https://github.com/yourusername/trippr.git
- cd trippr

### Install dependencies
npm install

### Add your API keys. Create a .env file in the root:
- OPENROUTER_API_KEY=your_openrouter_api_key_here

## Run the Project

### Backend (Node.js)
- Run node app.js in terminal

### Frontend (index.html)
- Run the index.html file from the folder or go to http://localhost:3000 after starting node server

## ⚙️ API Usage

### `POST /generate-itinerary`

Generate a travel itinerary.

#### 🧪 Sample Request

```bash
curl -X POST http://localhost:3000/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{"place": "Paris", "days": 3}'

## Example Response
Total places: 12, Path length: 12

1. Eiffel Tower - Cost: 500 INR, Distance: 0, Worth going to: 9.5/10  
   Description: Iconic iron lattice tower offering breathtaking views of Paris...

2. Musée d'Orsay - Cost: 400 INR, Distance: 1.8, Worth going to: 9.1/10  
   Description: Museum housed in a former railway station with French art...

...

## Technologies Used

- Node.js
- Express
- OpenRouter AI API
- Dynamic Programming TSP algorithm
- HTML
- CSS