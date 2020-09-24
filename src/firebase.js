import firebase from "firebase";


const firebaseApp = firebase.initializeApp({
apiKey: "AIzaSyDaEqCMKCDP7HPWrOVHEnRcekCP_0STb6s",
authDomain: "soc-med-app.firebaseapp.com",
databaseURL: "https://soc-med-app.firebaseio.com",
projectId: "soc-med-app",
storageBucket: "soc-med-app.appspot.com",
messagingSenderId: "655286622773",
appId: "1:655286622773:web:3c8aeeb9ee27f518f16f7c"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage};