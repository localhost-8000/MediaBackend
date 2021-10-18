require("./firebase_admin");
const admin = require("firebase-admin");

const auth = async (req, res, next) => {
    try {
        // console.log("req.headers: ", req.header("Authorization"));
        const receivedToken = await req.header("Authorization").replace("Bearer ", "");
        const decodedToken = await admin.auth().verifyIdToken(receivedToken.toString());
        const uid = decodedToken.uid;
        const user = await admin.auth().getUser(uid);
        if(!user) {
            res.status(422).send({ error: 'Not a authenticated user' })
        }
        req.user = user;
        next();

    } catch (err) {
        console.log(err);
        res.status(401).send({ error: 'Please authenticate.' })
    }
};

module.exports = auth;

