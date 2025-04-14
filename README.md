# 🌍 Trippr - AI-Powered Travel Itinerary Generator

**Trippr** is your personal AI travel buddy that builds **multi-day travel plans** for any destination. It smartly selects top tourist attractions, computes optimized travel paths, estimates costs, and even suggests hotel/flight booking links.

---

## 🚀 Features

- 🧠 **AI-generated day-by-day travel itinerary**
-  Optimized routes using **Traveling Salesman Problem (TSP)** algorithm
- Each attraction includes:
  -  Name
  -  Location (latitude/longitude)
  -  Ratings
  -  Estimated cost
  -  Description
---

## 📁 Project Structure

```bash
trippr/
├── index.js              # Node.js backend
├── .env                  # Necessary Make sure you add it
├── package.json
├── README.md
├── index.html            # Main Frontend website (Make sure you run it after starting backend server)
├── style.css             # Styling code for website (Includes Open Source UI Components)
```
---

## INSTALLATION

### Clone the repository
- git clone https://github.com/Rajpragur/trippr.git
- cd trippr

### Install dependencies
npm install

### Add your API keys. Create a .env file in the root:
- OPENROUTER_API_KEY=your_openrouter_api_key_here (Register on https://openrouter.ai/ and Get an API Key from there. It's free of cost.)

## Run the Project

### Backend (Node.js)
- Run node app.js in terminal           (Make sure you are in the /trippr/ directory while running it)

### Frontend (index.html)
- Run the index.html file from the folder or go to http://localhost:3000 after starting node server
---
## ⚙️ API Usage

- **LLaMA 4 Maverick** is fast for data because it's lightweight, uses efficient attention, possibly fine-tuned for structured tasks, and benefits from Meta’s optimized backend hosting. Major reason why it's chosen is because it's free of cost not needing any further charges.
---
### `POST /generate-itinerary`

- Sends a generate-itinerary request with two variables place and days from the input given on website
- Passes these variables to Openrouter API to fetch top Days*4 places with multiple values in **JSON Data Structure**
- **JSON Data Structure** also contains the latitude and longitude through which between every two nodes (cities) distance is calculated through [haversine distance](https://en.wikipedia.org/wiki/Haversine_formula).
- With these nodes and graph we use the [**Travel Salesman Problem**](https://www.cs.cmu.edu/~15451-s23/lectures/lec10-dp2.pdf).
- After getting the shortest sequence as indexes we backtrack it to get the original **JSON Data structure** in different order containing all the places in correct order.
- Used No. Of Places/No. Of Days to return the **day-wise itinerary**.

## Example Images

- Input Sample ![Image of Page](/running-sample.png)
- Loading Bar Sample ![Image of Page when loading](/loading-sample.png)
- Result Sample ![Image when Results are fetched](/result-sample.png)


## Technologies Used

- **Node.js**
- **Express**
- **OpenRouter AI API**
- **Dynamic Programming TSP algorithm**
- **HTML**
- **CSS**