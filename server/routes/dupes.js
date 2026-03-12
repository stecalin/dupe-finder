
const express = require("express");
const router = express.Router();
const Dupe = require("../models/Dupe");

// GET dupes by search query
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const results = await Dupe.find({
      query: { $regex: q, $options: "i" }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new dupe
router.post("/", async (req, res) => {
  try {
    const dupe = new Dupe(req.body);
    await dupe.save();
    res.status(201).json(dupe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a dupe by id
router.delete("/:id", async (req, res) => {
  try {
    await Dupe.findByIdAndDelete(req.params.id);
    res.json({ message: "Dupe deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
