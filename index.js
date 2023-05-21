const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.q8lcz01.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productsCollection = client.db("toysDB").collection("products");
    const toysCollection = client.db("toysDB").collection("addToys");

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const result = await productsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.post("/allToys", async (req, res) => {
      const result = await toysCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/allToys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/allToys/:id", async (req, res) => {
      const result = await toysCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const query = { email: req.params.email };
      const myToy = await toysCollection.find(query).toArray();
      res.send(myToy);
    });

    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const allData = await toysCollection.find().toArray();
      const result = allData.filter((data) =>
        data.name.toLowerCase().includes(text.toLowerCase())
      );
      res.send(result);
    });

    app.put("/updateToy/:id", async (req, res) => {
      try {
        const filter = { _id: ObjectId(req.params.id) };
        const { price, quantity, description } = req.body;
        const toys = {
          $set: {
            price,
            quantity,
            description,
          },
        };
        const updatedToys = await toysCollection.updateOne(filter, toys);
        res.send(updatedToys);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    // app.patch("/updateToy/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const {
    //     pictureUrl,
    //     name,
    //     subCategory,
    //     price,
    //     rating,
    //     availableQuantity,
    //     description,
    //   } = req.body;

    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       pictureUrl: pictureUrl,
    //       name: name,
    //       subCategory: subCategory,
    //       price: price,
    //       rating: rating,
    //       availableQuantity: availableQuantity,
    //       description: description,
    //     },
    //   };

    //   const result = await dollToys.updateOne(filter, updateDoc);
    //   res.send(result);
    // });

    app.delete("/deleteToy/:id", async (req, res) => {
      const filter = { _id: new ObjectId(req.params.id) };
      const result = await toysCollection.deleteOne(filter);
      console.log(result);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Cars Server is Running...");
});

app.listen(port, () => {
  console.log(`Toy cars server is running on PORT, ${port}`);
});
