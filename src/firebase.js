import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBz8ov39ArdLafOeWknpSjRvED8nBIonRc",
    authDomain: "wanty-things.firebaseapp.com",
    databaseURL: "https://wanty-things.firebaseio.com",
    projectId: "wanty-things",
    storageBucket: "wanty-things.appspot.com",
    messagingSenderId: "101260019554",
    appId: "1:101260019554:web:7bb2bc24bec282973ece3b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export default firebase;
