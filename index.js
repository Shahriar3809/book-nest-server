const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.port || 5000;
require("dotenv").config();


const corsOption = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://dream-library-5fb5d.web.app",
    "https://dream-library-5fb5d.firebaseapp.com",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());


// Jwt middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.send({ code: 401, message: "Un-authorized access" });
  }
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.send({code: 401, message: "Un-authorized access" });
      }

      req.user = decoded;
      

      next();
    });
  }
};



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

    // JWT

    // Generate Token when login
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });


    // Clear token on logout
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });

    const allBookCollection = client.db("dreamLibrary").collection("allBook");
    const borrowedBookCollection = client
      .db("dreamLibrary")
      .collection("borrowedBook");

    const categoryCollection = client.db("dreamLibrary").collection("category");


    app.get("/allBook", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      if (!tokenEmail) {
        return res.send({ code: 403, message: "Forbidden Access" });
      }
      

      const cursor = allBookCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allBookCollection.findOne(query);
      res.send(result);
    });

    app.get("/borrowedBooks", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const query = req.query;
      if(tokenEmail !== query.email) {
        return res.send({code: 403, message: "Forbidden Access"})
      }
      const result = await borrowedBookCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const query = req.body;
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/category/:name", async (req, res) => {
      const name = req.params.name;
      const query = { category_name: name };
      const result = await allBookCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addBook", verifyToken, async (req, res) => {
      const newBook = req.body;
      const userEmail = newBook.email
      // console.log(userEmail);
      const tokenEmail = req.user.email;
      if (tokenEmail !== userEmail) {
        return res.send({ code: 403, message: "Forbidden Access" });
      }
      const result = await allBookCollection.insertOne(newBook);
      res.send(result);
    });

    app.post("/borrowed", async (req, res) => {
      const newBorrow = req.body;
      // console.log(newBorrow)
      const query = {
        email: newBorrow.email,
        bookId: newBorrow.bookId,
        isBorrowed: true,
      };
      const alreadyBorrowed = await borrowedBookCollection.findOne(query);

      if (alreadyBorrowed) {
        return res.send("Already Borrowed This Book.");
      }

      const result = await borrowedBookCollection.insertOne(newBorrow);

      const updateDoc = { $inc: { quantity: -1 } };
      const bookQuery = { _id: newBorrow._id };
      const bookQuery1 = { _id: new ObjectId(newBorrow.bookId) };

      const updateQuantity = await borrowedBookCollection.updateOne(
        bookQuery,
        updateDoc
      );
      // console.log(updateQuantity)
      const updateQuantity1 = await allBookCollection.updateOne(
        bookQuery1,
        updateDoc
      );

      res.send(result);
    });

    app.delete("/returnBook/:id", async (req, res) => {
      const id = req.params.id;
      const query = { bookId: id };
      const result = await borrowedBookCollection.deleteOne(query);
      console.log(id);
      console.log(query);
      const bookQuery = { _id: new ObjectId(id) };
      // console.log(bookQuery)
      const updateDoc = { $inc: { quantity: 1 } };
      const updateQuantity1 = await allBookCollection.updateOne(
        bookQuery,
        updateDoc
      );
      res.send({ updateQuantity1, result });
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollection.findOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newInfo = req.body;
      // console.log(newInfo)
      const updateBook = {
        $set: {
          bookName: newInfo.bookName,
          photoUrl: newInfo.photoUrl,
          rating: newInfo.rating,
          author: newInfo.author,
          category_name: newInfo.category_name,
        },
      };
      const result = await allBookCollection.updateOne(
        filter,
        updateBook,
        options
      );
      res.send(result);
    });

    // Its optional
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
















