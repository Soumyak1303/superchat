import React, { useRef, useState } from "react";
import "./App.css";
//firebase sdk: connecting to auth and firestore services
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import 'firebase/auth';

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

//hooks
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAiMpMJ0AMMu9epBudsZByYcJsWVAokVLQ",
  authDomain: "superchat-31f88.firebaseapp.com",
  projectId: "superchat-31f88",
  storageBucket: "superchat-31f88.appspot.com",
  messagingSenderId: "509987623138",
  appId: "1:509987623138:web:a161691943914741e90ebb",
  measurementId: "G-X6S22CRDFN",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  //returns user obj if logged in else null;
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">Superchat</header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign out</button>
  );
}

function ChatRoom() {
  //creating reference to message collection in firebase db
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limitToLast(25);
  const [message] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const dummy = useRef();
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main>
        {message &&
          message.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          placeholder="Say something nice!"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClasses = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClasses}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
