import { useEffect, useState } from "react";
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

  const [userDataLocal, setUserDataLocal] = useState(
    JSON.parse(localStorage.getItem("userData")) || []
  );

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    if (storedUserData !== null) {
      setUserDataLocal(storedUserData);
    } else {
      // Handle the case when userData is null (e.g., user logged out)
      setIsLoggedInLocal(false);
      setIsFinishedLocal(false);
      setProfilePictureLocal(null);
    }
  }, [localStorage.getItem("userData")]);

  useEffect(() => {
    if (userDataLocal) {
      setIsLoggedInLocal(userDataLocal.isLoggedIn);
      setIsFinishedLocal(userDataLocal.isFinished);
      setProfilePictureLocal(userDataLocal.profilePicture);
      setUsernameLocal(userDataLocal.username);
    }
  }, [userDataLocal]);

  const [isLoggedInLocal, setIsLoggedInLocal] = useState(
    userDataLocal.isLoggedIn
  );
  const [isFinishedLocal, setIsFinishedLocal] = useState(
    userDataLocal.isFinished
  );
  const [profilePictureLocal, setProfilePictureLocal] = useState(
    userDataLocal.profilePicture
  );
  const [usernameLocal, setUsernameLocal] = useState(userDataLocal.username);

  const handleLogout = () => {
    console.log("logout function init");
    localStorage.removeItem("userData");
    setIsLoggedIn(null);
  };

  return (
    <div className={`App ${isFinishedLocal && "App_inFeed"}`}>
      {!isFinishedLocal ? (
        <Intro
          setIsLoggedIn={setIsLoggedIn}
          setIsFinished={setIsFinished}
          setProfileImage={setProfileImage}
          isLoggedIn={isLoggedIn}
          isFinished={isFinished}
          isLoggedInLocal={isLoggedInLocal}
          isFinishedLocal={isFinishedLocal}
          userDataLocal={userDataLocal}
          setUserDataLocal={setUserDataLocal}
        />
      ) : (
        <MainPage
          setIsFinished={setIsFinished}
          isLoggedIn={isLoggedIn}
          isFinished={isFinished}
          profilePictureLocal={profilePictureLocal}
          handleLogout={handleLogout}
        />
      )}
    </div>
  );
}

function Intro({
  setIsLoggedIn,
  setIsFinished,
  setProfileImage,
  isLoggedIn,
  isFinished,
  isLoggedInLocal,
  isFinishedLocal,
  userDataLocal,
  setUserDataLocal,
}) {
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
      <div
        className={`${authOpen ? "blur" : ""} ${
          isLoggedInLocal ? "blurExtra" : ""
        }`}
      >
        <video className="background_video" autoPlay loop muted playsInline>
          <source src="/assets/background/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {isLoggedInLocal && !isFinishedLocal ? (
        <FinishAccount
          setUserDataLocal={setUserDataLocal}
          userDataLocal={userDataLocal}
          setIsFinished={setIsFinished}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <>
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
        </>
      )}
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

            const userDataLocal = {
              userKey: userSnapshot.key,
              username: userData.username,
              email: userData.email,
              profilePicture: userData.profilePicture,
              isLoggedIn: true,
              isFinished: userData.isFinished,
            };

            localStorage.setItem("userData", JSON.stringify(userDataLocal));

            setIsLoggedIn(userKey);
            setIsFinished(userData.isFinished);
            setError("");
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
        isFinished: false,
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
            value={email}
            placeholder="Please enter your email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            name="email"
          />
          <label>Password</label>
          <input
            value={password}
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
            value={username}
            placeholder="Atleast 3 characters"
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            name="username"
          />
          <label>Email</label>
          <input
            value={email}
            placeholder="Please enter a valid email"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            name="email"
          />
          <label>Password</label>
          <input
            value={password}
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

function FinishAccount({
  isLoggedIn,
  setIsFinished,
  userDataLocal,
  setUserDataLocal,
}) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState("");
  const [visualProfilePicture, setVisualProfilePicture] = useState(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);

    if (file) {
      // Read the contents of the file as a data URL
      const reader = new FileReader();
      reader.onload = () => {
        // Set the data URL as the profilePicture state
        setVisualProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      const userKey = userDataLocal.userKey; // Assuming `isLoggedIn` contains the user key

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
        isFinished: true,
        isLoggedIn: true,
      };

      // const userDataLocal = {
      //   userKey: userSnapshot.key,
      //   username: userData.username,
      //   email: userData.email,
      //   profilePicture: userData.profilePicture,
      //   isLoggedIn: true,
      //   isFinished: userData.finished,
      // };

      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserDataLocal(updatedUserData);

      // setIsFinished(true);
      // localStorage.setItem("isFinished", true);

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
        <img
          src={visualProfilePicture || "/assets/placeholder_profile.jpg"}
          alt="profile"
          className="profile_picture-file"
        />
        <div className="image_upload">
          <label className="custom-file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            Upload your image
          </label>
          <div>No image selected</div>
        </div>
        <p>Create your bio</p>
        <input value={bio} onChange={(e) => setBio(e.target.value)} />
        <p onClick={handleUpload}>Upload</p>
      </div>
    </div>
  );
}

function MainPage({
  isLoggedIn,
  isFinished,
  setIsFinished,
  profilePictureLocal,
  handleLogout,
  usernameLocal,
}) {
  return (
    <>
      <TopBar
        handleLogout={handleLogout}
        profilePictureLocal={profilePictureLocal}
      />
      <Feed />
      {/* <NavBar /> */}
    </>
  );
}

function TopBar({
  isLoggedIn,
  profileImage,
  handleLogout,
  profilePictureLocal,
}) {
  const [openNav, setOpenNav] = useState(false);

  const handleOpenNav = () => {
    setOpenNav(!openNav);
  };

  return (
    <div className="top_bar">
      {openNav ? (
        <p onClick={() => handleLogout()}>Log out</p>
      ) : (
        <button className="top_bar-left" onClick={handleOpenNav}>
          <img src="/assets/nav.svg" alt="pus" />
        </button>
      )}

      <div className="top_bar-filler"></div>
      <img
        className="top_bar-profile_image"
        src={profilePictureLocal ? profilePictureLocal : "no image found"}
        alt="profile"
      />
    </div>
  );
}

function Feed({}) {
  const TopMentioned = [
    {
      id: 1,
      title: "Desert Safari",
      rating: 4,
      imagePath:
        "https://images.pexels.com/photos/2245436/pexels-photo-2245436.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      info: "Beautiful safari in the Egyptian desert",
    },
    {
      id: 2,
      title: "Manhattan",
      rating: 3.5,
      imagePath:
        "https://images.pexels.com/photos/2260786/pexels-photo-2260786.jpeg?auto=compress&cs=tinysrgb&w=800",
      info: "The Big Apple",
    },
    {
      id: 3,
      title: "Tokyo",
      rating: 3,
      imagePath:
        "https://images.pexels.com/photos/3536821/pexels-photo-3536821.jpeg?auto=compress&cs=tinysrgb&w=800",
      info: "Amazing city",
    },
  ];

  const [isTravelStoryOpen, setIsTravelStoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTopFeedClick = (item) => {
    setSelectedItem(item);
    setIsTravelStoryOpen(true);
  };

  return (
    <div className={`feed_container ${isAnimating ? "animate" : ""}`}>
      {isTravelStoryOpen ? (
        <TravelStory
          item={selectedItem}
          onClose={() => {
            setIsAnimating(true);
            setTimeout(() => {
              setIsTravelStoryOpen(false);
              setIsAnimating(false);
            }, 500); // Adjust the duration based on your animation time
          }}
        />
      ) : (
        <>
          <div className="feed_container-hero">
            <p>Escape the ordinary</p>
            <h2>Browse Getaways</h2>
          </div>
          <div className="top_feed-scroll">
            <div className="top_feed-container">
              {TopMentioned.map((item) => (
                <TopFeedIndivdual
                  key={item.id}
                  item={item}
                  handleTopFeedClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      handleTopFeedClick(item);
                      setIsAnimating(false);
                    }, 300); // Adjust the duration based on your animation time
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopFeedIndivdual({ item, handleTopFeedClick }) {
  return (
    <div className="top_feed-box" onClick={handleTopFeedClick}>
      <img
        className="top_feed-image"
        src={item.imagePath}
        alt="background feed"
      />
      <div className="top_feed-end">
        <h3 className="top_feed-title">{item.title}</h3>
        <p className="top_feed-info">{item.info}</p>
      </div>
    </div>
  );
}

function TravelStory({ item, onClose }) {
  return (
    <div className="travelstory_container">
      <div className="travelstory_background-container">
        <img
          className="travelstory_background"
          src={item.imagePath}
          alt={item.title}
        />
      </div>
      <div className="travelstory_container-info">
        <h2>{item.title}</h2>

        <button onClick={onClose}>Close Travel Story</button>
      </div>
    </div>
  );
}

function NavBar() {
  return <div>NavBar</div>;
}

export default App;
