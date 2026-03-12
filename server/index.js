const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const dupesRoute = require("./routes/dupes");
const amazonRoute = require("./routes/amazon");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log(err));

app.use("/api/dupes", dupesRoute);
app.use("/api/amazon", amazonRoute);

app.get("/", (req, res) => {
  res.send("Dupe Finder API is running ✨");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));