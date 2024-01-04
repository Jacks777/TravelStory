import { useState } from "react";
import "./App.css";

import {
  ref as dbRef,
  push as dbPush,
  set as dbSet,
  get,
  orderByChild,
  equalTo,
  query,
  ref,
  push,
  set,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { databaseInstance, storageInstance } from "./config";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Intro
          setIsLoggedIn={setIsLoggedIn}
          setIsFinished={setIsFinished}
          setProfileImage={setProfileImage}
        />
      ) : (
        <MainPage
          setIsFinished={setIsFinished}
          isLoggedIn={isLoggedIn}
          isFinished={isFinished}
          profileImage={profileImage}
        />
      )}
    </div>
  );
}

function Intro({ setIsLoggedIn, setIsFinished, setProfileImage }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [error, setError] = useState("");

  const handleOpenAuth = () => {
    setAuthOpen(!authOpen);
  };

  document.addEventListener("DOMContentLoaded", function () {
    const open_app = document.getElementById("open_app");

    open_app.addEventListener("animationend", function () {
      open_app.classList.add("done");
    });
  });

  return (
    <div className="auth_container">
      <div className={`error_message ${error ? "active" : ""}`}>
        <div>{error}</div>
      </div>
      <div className={`${authOpen ? "blur" : ""}`}>
        <video className="background_video" autoPlay loop muted playsInline>
          <source src="/assets/background/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className={`filler ${authOpen && "filler_up"}`}></div>
      <div className="main_text">
        <h2>Share.</h2>
        <h2>Your.</h2>
        <h2>Stories.</h2>
      </div>
      <div className={`auth_container-end ${authOpen && "auth"}`}>
        {authOpen ? (
          <Auth
            setProfileImage={setProfileImage}
            setIsFinished={setIsFinished}
            setIsLoggedIn={setIsLoggedIn}
            setError={setError}
          />
        ) : (
          <IntroMessage handleOpenAuth={handleOpenAuth} />
        )}
      </div>
    </div>
  );
}

function IntroMessage({ handleOpenAuth }) {
  return (
    <>
      <p onClick={handleOpenAuth} className="open_app-button" id="open_app">
        Start sharing
      </p>
    </>
  );
}

function Auth({ setError, setIsLoggedIn, setIsFinished, setProfileImage }) {
  const [login, setLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const usersRef = ref(databaseInstance, "users");

    try {
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        let credentialsMatch = false;

        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          const userEmail = userData.email;
          const userPasswordHash = userData.password;

          if (
            userEmail === email &&
            hashPassword(password) === userPasswordHash
          ) {
            credentialsMatch = true;
            const userKey = userSnapshot.key;
            console.log(
              "Credentials Match Found - User Key:",
              userKey,
              "User Data:",
              userData
            );
            setIsLoggedIn(userKey);
            setIsFinished(userData.finished);
            if (userData.profilePicture) {
              setProfileImage(userData.profilePicture);
            }
          }
        });

        if (!credentialsMatch) {
          setError("Email or password is incorrect.");
          console.log(
            "Email or password does not match any user in the database"
          );
        }
      } else {
        setError("No users found.");
        console.log("No users found");
      }
    } catch (error) {
      console.error("Error checking credentials: ", error);
    }
  };

  const handleRegister = async () => {
    const usersRef = ref(databaseInstance, "users");

    const validateEmail = (email) => {
      // Regular expression for a basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      return emailRegex.test(email);
    };

    if (email.length < 1 || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6 || password.length > 48) {
      setError(
        "Password should contain at least 6 characters, and not more than 48"
      );
      return;
    }

    if (username.length < 3 || username.length > 24) {
      setError(
        "Username should contain at least 3 characters, and not more than 24."
      );
      return;
    }

    try {
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        let emailUsed = false;
        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          const userEmail = userData.email;

          if (userEmail === email) {
            emailUsed = true;
            setError("Email is already taken");
            return;
          }
        });

        if (emailUsed) {
          setError("Email is already taken");
          console.log("Email already taken.");
          return;
        }
      } else {
      }
    } catch (error) {
      console.error("Error checking credentials: ", error);
    }

    try {
      const hashedPassword = hashPassword(password);

      const newUserData = {
        username,
        email,
        password: hashedPassword,
        finished: false,
      };

      const newPushRef = push(usersRef);
      await set(newPushRef, newUserData);

      console.log("Data pushed successfully with key: ", newPushRef.key);

      setLogin(true);
    } catch (error) {
      console.error("Error pushing data: ", error);
    }
  };

  const hashPassword = (password) => {
    let hashedPassword = 0;
    for (let i = 0; i < password.length; i++) {
      const charCode = password.charCodeAt(i);
      hashedPassword = (hashedPassword << 5) - hashedPassword + charCode;
    }

    return String(hashedPassword);
  };

  return (
    <>
      {login ? (
        <>
          <label>Email</label>
          <input
            placeholder="Please enter your email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            name="email"
          />
          <label>Password</label>
          <input
            placeholder="Please enter your password"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
          />
          <h3 onClick={handleLogin}>Log in</h3>
          <p onClick={() => setLogin(!login)}>or Register</p>
        </>
      ) : (
        <>
          <label>Username</label>
          <input
            placeholder="Atleast 3 characters"
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            name="username"
          />
          <label>Email</label>
          <input
            placeholder="Please enter a valid email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
          />
          <label>Password</label>
          <input
            placeholder="Atleast 6 characters"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
          />
          <h3 onClick={handleRegister}>Register</h3>
          <p
            onClick={() => {
              setLogin(!login);
              setError("");
            }}
          >
            or Login
          </p>
        </>
      )}
    </>
  );
}

function MainPage({ isLoggedIn, isFinished, setIsFinished, profileImage }) {
  return (
    <>
      {isFinished ? (
        <>
          <TopBar profileImage={profileImage} />
          <Feed />
          <NavBar />
        </>
      ) : (
        <FinishAccount setIsFinished={setIsFinished} isLoggedIn={isLoggedIn} />
      )}
    </>
  );
}

function FinishAccount({ isLoggedIn, setIsFinished }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState("");

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleUpload = async () => {
    try {
      if (!profilePicture) {
        console.error("Profile picture is null or undefined");
        return;
      }

      // Upload image to Firebase Storage
      const storageReference = storageRef(
        storageInstance,
        `profile_pictures/${profilePicture.name}`
      );
      await uploadBytes(storageReference, profilePicture);

      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageReference);

      // Get the user's key from the state
      const userKey = isLoggedIn; // Assuming `isLoggedIn` contains the user key

      if (!userKey) {
        console.error("User key not found");
        return;
      }

      // Reference to the specific user in the database
      const userRef = dbRef(databaseInstance, `users/${userKey}`);

      // Get the existing user data
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (!userData) {
        console.error("User not found");
        return;
      }

      // Update the user's data with the new bio and profile picture
      const updatedUserData = {
        ...userData,
        profilePicture: downloadURL,
        bio,
        finished: true,
      };

      setIsFinished(true);

      // Set the updated data back to the database
      await dbSet(userRef, updatedUserData);

      console.log("Profile picture and bio updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture and bio:", error);
    }
  };

  return (
    <div className="finish_account">
      <div className="finish_account-top">
        <h2>Hi!</h2>
        <p>And welcome to TravelStory</p>
      </div>
      <div className="finish_account-inner">
        <p>Here you can customise your account.</p>
        <div className="image_upload">
          <label className="custom-file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            Upload your image
          </label>
          <text>No image selected</text>
        </div>
        <p>Create your bio</p>
        <input value={bio} onChange={(e) => setBio(e.target.value)} />
        <p onClick={handleUpload}>Upload</p>
      </div>
    </div>
  );
}

function TopBar({ isLoggedIn, profileImage }) {
  return (
    <div className="top_bar">
      <div className="top_bar-filler"></div>
      <img
        className="top_bar-profile_image"
        src={profileImage ? profileImage : "no image found"}
        alt="profile"
      />
    </div>
  );
}

function Feed() {
  return <div>Feed</div>;
}

function NavBar() {
  return <div>NavBar</div>;
}

export default App;
