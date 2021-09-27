
//=============require module=============================

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');                                                   
const morgan = require('morgan');
// const multer = require('multer');

//========================================================

//========require routes==================================

const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')


//========================================================



dotenv.config();

// initializing app......
const app = express();


// setup mongoDB connection....
mongoose.connect(process.env.MONGO_URL, 
    { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then( () => {
        console.log('Connected to MongoDB server...');
    })
    .catch( err => {
        console.log('No connection...', err);
    }) 


// middleware setup....

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(helmet())
app.use(morgan("common"))

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/images")
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// })
// const upload = multer({storage});

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//     try {
//         return res.status(200).json("File uploaded successfully");
//     } catch (err) {

//     }
// })


app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);






// starting server......
app.listen(3000, () => {
    console.log('Backend server started at port 3000...');
})