const express = require('express')
const app = express()

app.use("/static", express.static("static"));
app.use("/resources", express.static("resources"))
app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"))
app.get("/newset", (req, res) => res.sendFile(__dirname + "/newset.html"));

app.listen(3000, () => console.log('Example app listening on port 3000!'))