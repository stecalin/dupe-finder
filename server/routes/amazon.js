const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(
      "https://axesso-axesso-amazon-data-service-v1.p.rapidapi.com/amz/amazon-search-by-keyword-asin",
      {
        params: {
          domainCode: "com",
          keyword: q,
          page: "1",
          excludeSponsored: "false",
          sortBy: "relevanceblender",
          withCache: "true"
        },
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "axesso-axesso-amazon-data-service-v1.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY
        }
      }
    );

    const products = response.data.searchProductDetails
      .filter(p => p.imgUrl && p.price)
      .slice(0, 8)
      .map(p => ({
        name: p.productDescription,
        brand: p.manufacturer || "Amazon",
        price: p.price,
        image: p.imgUrl,
        link: `https://amazon.com${p.dpUrl}`
      }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;