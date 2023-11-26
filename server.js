const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");

app.use(cors());

const connectDB = require("./config/db");

//Middleware

app.use(express.json({ limit: "50mb" }));

connectDB();
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/login"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/posts", require("./routes/post"));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Started to port ${PORT}`));
