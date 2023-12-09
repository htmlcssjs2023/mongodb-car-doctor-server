const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Dot env file access 
require('dotenv').config();
const port = process.env.PORT ||4000;

// Middleware
app.use(express.json());
app.use(cors());

//===================  Connecting application server with mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.robds1t.mongodb.net/?retryWrites=true&w=majority`;

// Create client for STABLE api verison
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true, 
      deprecationErrors: true,
    }
  });

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   const servicesCollection = client.db('carDoctor').collection('services');
   const ordersCollection = client.db('carDoctor').collection('orders');

   app.get('/services', async(req, res)=>{
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);

   })

   app.get('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const options = {
  
        // Include only the `title` and `imdb` fields in the returned document
        projection: {title: 1, price: 1, service_id: 1, img: 1},
      };

      const result = await servicesCollection.findOne(query, options);
      res.send(result);
   })

   app.post('/orders', async(req, res)=>{
      const order = req.body;
      const result =await ordersCollection.insertOne(order);
      res.send(result);
      console.log(order);
   })

   app.get('/orders', async(req, res)=>{
      // console.log(req.query);
      let query = {}

      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
   })

   // ============ Delete orders ==========

   app.delete('/orders/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
   })

   // =============== Update single user ===========
   app.patch('/orders/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedOrder = req.body;
      console.log(updatedOrder);
      const updateDoc = {
        $set:{
          status:updatedOrder.status
        },
      }
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.send(result);
   })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Application server successfully connected to the MongoDB !");
  } 
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


//Server Listener
app.listen(port, ()=>{
    console.log(`Server is running at : http://localhost:${port}`);
})



