const admin = require("firebase-admin");

const serviceAccountKey = require("./service_account_key");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
});

