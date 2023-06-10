const { Database } = require("@tableland/sdk");
const { Wallet, getDefaultProvider } = require("ethers");
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();
const app = express();
const port = 3001;
app.use(cors());
app.use(bodyParser.json());

// const privateKey = process.env.PRIVATE_KEY;
const privateKey =
  "9be733bc5526347f994a33c964ebcf278bdf0036c9daf4587808657ce23296b9";

const wallet = new Wallet(privateKey);

const provider = getDefaultProvider("https://rpc-mumbai.maticvigil.com"); // Update with your desired provider URL
const signer = wallet.connect(provider);

// Connect to the database
const db = new Database({ signer });

const prefix = "d_loom_userdata";
const insertprefix = "d_loom_userdata_80001_6773";

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/create", async (req, res) => {
  console.log("i am here");
  try {
    const { meta: create } = await db
      .prepare(
        `CREATE TABLE ${prefix} (id integer primary key, firstname text, lastname text, username text, email text, logocid text, address text);`
      )
      .run();
    console.log("i am");
    res.json({ tableName: create.txn.name });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/insertuserdata", async (req, res) => {
  console.log(req.body);
  try {
    const { meta: insert } = await db
      .prepare(
        `INSERT INTO ${insertprefix} (id, firstname, lastname, username, email, logocid, address) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        req.body.id,
        req.body.firstname,
        req.body.lastname,
        req.body.username,
        req.body.email,
        req.body.logocid,
        req.body.address
      )
      .run();
    console.log("test");
    await insert.txn.wait();
    res.json({ success: true });
  } catch (error) {
    console.error("Error inserting row:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/readdata", async (req, res) => {
  try {
    console.log("serching...");
    const { results } = await db
      .prepare(
        `SELECT * FROM ${insertprefix} WHERE address = "${req.query.address}";`
      )
      .all();
    console.log(results);
    res.json(results);
  } catch (error) {
    console.error("Error retrieving data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
