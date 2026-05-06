const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyzeRoutes");
const copayRoutes = require("./routes/copayRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/analyze-symptom", analyzeRoutes);
app.use("/estimate-copay", copayRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Unexpected error" });
});

module.exports = { app };
