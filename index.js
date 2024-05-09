const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.port || 5000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jryyhrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const allBookCollection = client.db("dreamLibrary").collection("allBook");
    const borrowedBookCollection = client
      .db("dreamLibrary")
      .collection("borrowedBook");

    const categoryCollection = client
      .db("dreamLibrary")
      .collection("category");

    app.get("/allBook", async (req, res) => {
      const cursor = allBookCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    });


    app.get('/details/:id', async (req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await allBookCollection.findOne(query)
      res.send(result);
    })


    app.get("/borrowedBooks", async(req, res)=> {
      const query = req.query;
      const result = await borrowedBookCollection.find(query).toArray();
        res.send(result);
    });

    app.get("/category", async(req, res)=> {
        const query = req.body;
        const result = await categoryCollection.find(query).toArray();
        res.send(result)
    })

    app.get('/category/:name', async(req, res)=> {
        const name = req.params.name;
        console.log(name)
        const query = { category_name: name };
        const result = await allBookCollection.find(query).toArray();
        res.send(result)
    })

 

    


    app.post("/addBook", async(req, res)=> {
        const newBook = req.body;
        console.log(newBook)
        const result = await allBookCollection.insertOne(newBook)
        res.send(result)
    });


    app.post("/borrowed", async(req, res)=> {
        const newBorrow = req.body;
        const result = await borrowedBookCollection.insertOne(newBorrow);
        res.send(result)
    });
















    // Its optional
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running..");
});

app.listen(port, () => {
  console.log(`Server is Running on port, ${port}`);
});

// const express = require('express');
// const cors = require('cors')
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const app = express();
// const port = process.env.port || 5001
// require('dotenv').config();

// // Middleware
// app.use(cors())
// app.use(express.json())

// // URI
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jryyhrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {

//     // await client.connect();

//     const craftCollection = client.db('artAndCraftDB').collection('craft')
//     const paintingCollection = client.db('artAndCraftDB').collection('painting')

//     app.get('/crafts', async (req, res)=> {
//         const cursor = craftCollection.find();
//         const result = await cursor.toArray()
//         res.send(result);
//     })

//     app.get('/painting', async (req, res)=> {
//         const cursor = paintingCollection.find();
//         const result = await cursor.toArray()
//         res.send(result);
//     })

//     app.post('/crafts', async (req, res)=> {
//         const newCraft = req.body;
//         const result = await craftCollection.insertOne(newCraft);
//         res.send(result);
//     })

//     app.post('/painting', async (req, res)=> {
//         const newPainting = req.body;
//         const result = await paintingCollection.insertOne(newPainting);
//         res.send(result);
//     })

//     app.get('/myCraft/:email', async (req, res)=> {
//         const email = req.params.email;
//         const query = {user_email: email}
//         const result = await craftCollection.find(query).toArray();
//         res.send(result)
//     })

//     app.get('/category/:sub_category_name', async (req, res)=> {
//         const category_name = req.params.sub_category_name;
//         const query = {sub_category_name: category_name}
//         const result = await craftCollection.find(query).toArray();
//         res.send(result)
//     })

//     app.get('/details/:id', async (req, res)=> {
//       const id = req.params.id;
//       const query = {_id: new ObjectId(id)};
//       const result = await craftCollection.findOne(query)
//       res.send(result);
//     })

//     app.put('/crafts/:id', async(req, res)=> {
//       const id = req.params.id;
//       const filter = {_id: new ObjectId(id)};
//       const options = {upsert: true};
//       const craft = req.body;
//       const updatedCraft = {
//         $set : {
//           customization: craft.customization,
//           description: craft.description,
//           item_name: craft.item_name,
//           photo: craft.photo,
//           price: craft.price,
//           processing_time: craft.processing_time,
//           rating: craft.rating,
//           stock_status: craft.stock_status,
//           sub_category_name: craft.sub_category_name,
//           user_email: craft.user_email,
//           user_name: craft.user_name,
//         }
//       }
//       const result = await craftCollection.updateOne(filter, updatedCraft, options)
//       res.send(result)
//     })

//     app.delete('/crafts/:id', async(req, res)=> {
//       const id = req.params.id;
//       const query = {_id: new ObjectId(id)};
//       const result = await craftCollection.deleteOne(query)
//       res.send(result)
//     })

//     // Its optional
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");

//   } finally {

//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.get('/', (req, res)=> {
//     res.send('Art and Craft Server is running..')
// })

// app.listen(port, ()=> {
//     console.log(`Art and Craft Server is Running on port, ${port}`)
// })























// const express = require("express");
// const cors = require("cors");
// const app = express();
// const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// require("dotenv").config();

// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

// // middleware
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://cars-doctor-940fa.web.app",
//       "https://cars-doctor-940fa.firebaseapp.com",
//     ],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jryyhrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// // middleware------------------------------------------------------
// const verifyToken = async (req, res, next) => {
//   const token = req.cookies?.token;
//   console.log("value of token in middleware", token);
//   if (!token) {
//     return res.status(401).send({ message: "Not authorized" });
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       console.log(err);
//       return res.status(401).send({ message: "Not Authorized" });
//     }
//     console.log("value in the decoded: ", decoded);
//     req.user = decoded;
//     next();
//   });
// };

// const cookieOptions = {
//   httpOnly: true,
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//   secure: process.env.NODE_ENV === "production" ? true : false,
// };

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const serviceCollection = client.db("carDoctor").collection("services");
//     const bookingCollection = client.db("carDoctor").collection("bookings");



//     // Auth related api
//     app.post("/jwt", async (req, res) => {
//       const user = req.body;
//       console.log("Hitting JWT", user);
//       // here user is an object //Generate Token:
//       const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: "1h",
//       });

//       // set token to cookie
//       res.cookie("token", token, cookieOptions).send({ success: true });
//     });
//     // generate random access token
//     //  require('crypto').randomBytes(64).toString('hex')

//     app.post("/logout", async (req, res) => {
//       const user = req.body;
//       console.log("logOut", user);
//       res
//         .clearCookie("token", { ...cookieOptions, maxAge: 0 })
//         .send({ success: true });
//     });



//     // service related api
//     app.get("/services", async (req, res) => {
//       const cursor = serviceCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     });




//     app.get("/services/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       // specific property data getting
//       const options = {
//         projection: { title: 1, price: 1, serviceId: 1, img: 1 },
//       };
//       const result = await serviceCollection.findOne(query, options);
//       res.send(result);
//     });




//     //  Bookings
//     app.post("/bookings", async (req, res) => {
//       const booking = req.body;
//       // console.log(booking)
//       const result = await bookingCollection.insertOne(booking);
//       res.send(result);
//     });




//     app.get("/bookings", verifyToken, async (req, res) => {
//       // console.log(req.query)
//       console.log("Request Cookies: ", req.cookies.token);
//       console.log("valid token: ", req.user);

//       if (req.query.email !== req.user.email) {
//         return res.status(403).send({ message: "Forbidden" });
//       }

//       let query = {};

//       if (req.query?.email) {
//         query = { customerEmail: req.query.email };
//       }
//       // console.log(query)
//       const result = await bookingCollection.find(query).toArray();
//       res.send(result);
//     });





//     // Delete

//     app.delete("/bookings/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await bookingCollection.deleteOne(query);
//       res.send(result);
//     });






//     // Update
//     app.patch("/bookings/:id", async (req, res) => {
//       const id = req.params.id;
//       const filter = { _id: new ObjectId(id) };
//       const updatedBooking = req.body;
//       console.log(updatedBooking);
//       // const options =
//       const updatedDoc = {
//         $set: {
//           status: updatedBooking.status,
//         },
//       };
//       const result = await bookingCollection.updateOne(filter, updatedDoc);
//       res.send(result);
//     });

