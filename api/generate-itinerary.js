export const config = {
    runtime: 'edge', // Optional: Use edge runtime for faster cold starts
  };
  
  const INF = 1e9;
  
  function dist(x1, y1, x2, y2) {
    return 2 * 6371 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((x2 - x1) * Math.PI / 360), 2) +
      Math.cos(x1 * Math.PI / 180) *
      Math.cos(x2 * Math.PI / 180) *
      Math.pow(Math.sin((y2 - y1) * Math.PI / 360), 2)
    ));
  }
  
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
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Only POST allowed' });
    }
  
    try {
      const body = await req.json();
      const { place, days } = body;
  
      if (!place || !days) {
        return res.status(400).json({ error: "Missing place or days" });
      }
  
      const prompt = `Generate a detailed travel itinerary for the city of "${place}" for ${days} days. I need exactly ${days * 4} different tourist places...`; // Truncated for brevity
  
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
  
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      const cleaned = content.replace(/^```json|```$/g, '').trim();
      const itinerary = JSON.parse(cleaned);
  
      const uniquePlaces = itinerary.places.reduce((acc, place) => {
        const normName = place.name.toLowerCase().trim();
        if (!acc.some(p => {
          const existing = p.name.toLowerCase().trim();
          return existing === normName ||
            existing.includes(normName) || normName.includes(existing);
        })) acc.push(place);
        return acc;
      }, []);
  
      const mat = Array.from({ length: uniquePlaces.length }, () => new Array(uniquePlaces.length).fill(0));
      for (let i = 0; i < uniquePlaces.length; i++) {
        for (let j = 0; j < uniquePlaces.length; j++) {
          if (i !== j) {
            mat[i][j] = dist(
              uniquePlaces[i].location.latitude,
              uniquePlaces[i].location.longitude,
              uniquePlaces[j].location.latitude,
              uniquePlaces[j].location.longitude
            );
          }
        }
      }
  
      const path = tspDP(mat);
  
      return res.status(200).json({
        ...itinerary,
        places: uniquePlaces,
        optimal_path: path.map(i => uniquePlaces[i])
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
  