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
  onValue,
  off,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { databaseInstance, storageInstance } from "./config";
import AnimationComponent from "./AnimationComponent";
import AnimationComponentClean from "./AnimationComponentClean";

import imageCompression from "browser-image-compression";

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
    <div className={`App ${isFinishedLocal ? "App_inFeed" : ""}`}>
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
          usernameLocal={usernameLocal}
        />
      ) : (
        <MainPage
          setIsFinished={setIsFinished}
          isLoggedIn={isLoggedIn}
          isFinished={isFinished}
          profilePictureLocal={profilePictureLocal}
          handleLogout={handleLogout}
          usernameLocal={usernameLocal}
        />
      )}
    </div>
  );
}

function Intro({
  usernameLocal,
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
          usernameLocal={usernameLocal}
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
  usernameLocal,
  isLoggedIn,
  setIsFinished,
  userDataLocal,
  setUserDataLocal,
}) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState("");
  const [visualProfilePicture, setVisualProfilePicture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
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
        setIsLoading(false);

        return;
      }

      // Reference to the specific user in the database
      const userRef = dbRef(databaseInstance, `users/${userKey}`);

      // Get the existing user data
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (!userData) {
        console.error("User not found");
        setIsLoading(false);

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
      setIsLoading(false);
      console.log("Upload done");
      console.log("Profile picture and bio updated successfully!");
    } catch (error) {
      console.error("Error updating profile picture and bio:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <AnimationComponent />
      ) : (
        <div className="finish_account">
          <div className="finish_account-top">
            <h2>Hi {usernameLocal}!</h2>
            <p>To use TravelStory you need to complete your account.</p>
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
                Upload image
              </label>
            </div>
            <p>Create your bio</p>
            <textarea
              className="finish_account-inner_input-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
            <p
              className="finish_account-button"
              onClick={() => {
                handleUpload();
              }}
            >
              Finish Account
            </p>
          </div>
        </div>
      )}
    </>
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
  const [isTravelStoryOpen, setIsTravelStoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [information, setInformation] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage) {
      setIsUploading(true);
      try {
        // Generate a unique identifier for the image file
        const imageFileName = `${Date.now()}-${selectedImage.name}`;
        const imageRef = storageRef(storageInstance, `images/${imageFileName}`);

        // Upload the image to Firebase Storage
        await uploadBytes(imageRef, selectedImage);

        // Get the download URL of the uploaded image
        const imageURL = await getDownloadURL(imageRef);

        // Update the state with the image URL
        setImage(imageURL);
        setIsUploading(false);
      } catch (error) {
        console.error("Error uploading image:", error);
        setIsUploading(false);
        // Handle the error, e.g., show a message to the user
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddTravelStoryToDB = async () => {
    try {
      setIsLoading(true);

      const travelstoriesRef = ref(databaseInstance, "travelstories");

      // If you are adding a new travel story, push it to the database
      // If you are updating an existing travel story, you might use set instead
      const newTravelStory = {
        title,
        price,
        location,
        info: information,
        imagePath: image,
        user: usernameLocal,
        rating: 0,
      };
      const newPushRef = push(travelstoriesRef);
      await set(newPushRef, newTravelStory);

      // Reset form values after successful addition to the database
      setTitle("");
      setPrice("");
      setInformation("");
      setLocation("");
      setImage(null);

      console.log("Travel story added to the database");
      setIsLoading(false);
      setIsSpinning(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding travel story to the database:", error);
    }
  };

  return (
    <>
      {isTravelStoryOpen ? (
        <TravelStory
          item={selectedItem}
          onClose={() => {
            setIsAnimating(true);
            setTimeout(() => {
              setIsTravelStoryOpen(false);
              setIsAnimating(false);
            }, 300);
          }}
        />
      ) : (
        <>
          {!isSpinning ? (
            <>
              <TopBar
                handleLogout={handleLogout}
                profilePictureLocal={profilePictureLocal}
              />
              <Feed
                setSelectedItem={setSelectedItem}
                setIsTravelStoryOpen={setIsTravelStoryOpen}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
                selectedItem={selectedItem}
              />
            </>
          ) : isLoading ? (
            <AnimationComponent />
          ) : (
            <AddTravelStory
              title={title}
              setTitle={setTitle}
              price={price}
              setPrice={setPrice}
              information={information}
              setInformation={setInformation}
              image={image}
              setImage={setImage}
              handleImageChange={handleImageChange}
              setLocation={setLocation}
              location={location}
              isUploading={isUploading}
            />
          )}
          <NewTravelStoryButton
            handleAddTravelStoryToDB={handleAddTravelStoryToDB}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
        </>
      )}
    </>
  );
}

function AddTravelStory({
  title,
  setTitle,
  price,
  setPrice,
  information,
  setInformation,
  image,
  setImage,
  handleImageChange,
  setLocation,
  location,
  isUploading,
}) {
  const handlePriceChange = (e) => {
    const input = e.target.value;

    if (input.length < 8) {
      if (!isNaN(input) || input === "," || input === ".") {
        setPrice(input);
      }
    }
  };

  const handleTitleChange = (e) => {
    // Limit title to 40 characters
    const input = e.target.value.slice(0, 40);
    setTitle(input);
  };

  const handleInformationChange = (e) => {
    // Limit information to 200 characters
    const input = e.target.value.slice(0, 200);
    setInformation(input);
  };
  const handleLocationChange = (e) => {
    // Limit information to 200 characters
    const input = e.target.value.slice(0, 25);
    setLocation(input);
  };

  return (
    <div className="addtravelstory_container">
      <div className="addtravelstory_container-start">
        <h2>Share your TravelStory!</h2>
      </div>
      <div className="addtravelstory_container-form">
        <div>
          <label>Title</label>
          <textarea
            value={title}
            onChange={handleTitleChange}
            placeholder="Dubai Mall"
          ></textarea>
        </div>
        <div>
          <label>Price</label>
          <textarea
            value={price}
            onChange={handlePriceChange}
            placeholder="€49.99"
          ></textarea>
        </div>
        <div>
          <label>Information</label>
          <textarea
            value={information}
            onChange={handleInformationChange}
            placeholder="Main information"
          ></textarea>
        </div>
        <div>
          <label>Location</label>
          <textarea
            value={location}
            onChange={handleLocationChange}
            placeholder="UAE"
          ></textarea>
        </div>
        <div className="travelstory_image_upload-container">
          <input
            className="travelstory_image_upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="fileInput"
          />
          <label htmlFor="fileInput">Upload Image</label>
        </div>
        <div className="addtravelstory_placeholder_container">
          {isUploading ? (
            <AnimationComponentClean />
          ) : (
            image && (
              <img
                className="addtravelstory_placeholder_img"
                src={image}
                alt="travelstory"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function TopBar({ isLoggedIn, handleLogout, profilePictureLocal }) {
  const [openNav, setOpenNav] = useState(false);
  const [openHowto, setOpenHowto] = useState(false);

  const handleOpenNav = () => {
    const howto_navbar = document.getElementById("howto_navbar");

    setOpenNav(!openNav);
    setOpenHowto(false);

    if (!openHowto) {
      howto_navbar.classList.remove("viewed");
    }
  };

  const handleOpenHowTo = () => {
    const howto_navbar = document.getElementById("howto_navbar");

    setOpenHowto(!openHowto);

    setTimeout(() => {
      if (!howto_navbar.classList.contains("viewed")) {
        howto_navbar.classList.add("viewed");
      } else {
        howto_navbar.classList.remove("viewed");
      }
    }, 300);

    console.log();
  };

  return (
    <div className="top_bar">
      <button
        className={`top_bar-left ${openNav ? "top_bar-left_active" : ""}`}
        onClick={handleOpenNav}
      >
        <img src="/assets/nav.svg" alt="nav button" />
      </button>
      <div
        className={`top_bar-navbar ${openNav ? "active_navbar" : ""} ${
          openHowto ? "active_howto" : ""
        }`}
      >
        <div>
          <p
            onClick={() => {
              handleOpenNav();
              setOpenHowto(false);
            }}
          >
            X
          </p>
          <p
            onClick={() => {
              handleOpenHowTo();
            }}
          >
            How to use Travelstory
          </p>
          {!openHowto && (
            <>
              <p>Contact</p>
              <p>Mission</p>
              <p>And more...</p>

              <p onClick={() => handleLogout()}>Log out</p>
            </>
          )}
        </div>

        <div id="howto_navbar" className="howto_navbar">
          {openHowto && (
            <>
              <h3>Sharing TravelStories</h3>
              <p>
                You can upload your getaways from A-Z.<br></br> Add pictures and
                prices to let other Travelers know what to expect.
              </p>
              <h3>Search TravelStories</h3>
              <p>
                Everyone can upload getaways. You can search keywords and find
                the getaway you're looking for! Rate the getaway or leave a
                review to let the other Travelers know what you've experienced
              </p>
              <h3>Bookmark, ratings and reviews</h3>
              <p>
                You can bookmark any TravelStory to save it for later. You can
                also rate them and leave a review to tell others what your
                experiences were.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="top_bar-filler"></div>
      <img
        className="top_bar-profile_image"
        src={
          profilePictureLocal
            ? profilePictureLocal
            : "assets/placeholder_profile.jpg"
        }
        alt="profile"
      />
    </div>
  );
}

function Feed({
  setSelectedItem,
  setIsTravelStoryOpen,
  isAnimating,
  setIsAnimating,
  selectedItem,
}) {
  const [allTravelStories, setAllTravelStories] = useState([]);

  useEffect(() => {
    const travelstoriesRef = ref(databaseInstance, "travelstories");

    const fetchData = () => {
      onValue(travelstoriesRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert the data object into an array
          const dataArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setAllTravelStories(dataArray);
        }
      });
    };

    fetchData();
    return () => {
      off(travelstoriesRef);
    };
  }, []);

  return (
    <div className="feed_container">
      <div className="feed_container-hero">
        <p>Escape the ordinary</p>
        <h2>Browse Getaways</h2>
      </div>
      <div className="top_feed-scroll">
        <div className="top_feed-container">
          {allTravelStories.slice(0, 5).map((item) => (
            <TopFeedIndivdual
              selectedItem={selectedItem}
              key={item.id}
              isAnimating={isAnimating}
              item={item}
              handleFeedClick={() => {
                setIsAnimating(true);
                setSelectedItem(item);
                setTimeout(() => {
                  setIsTravelStoryOpen(true);
                  setIsAnimating(false);
                }, 300);
              }}
            />
          ))}
        </div>
      </div>
      {allTravelStories.slice(5).map((item) => (
        <div className="recent_feed_container" key={item.id}>
          <RecentFeed
            selectedItem={selectedItem}
            isAnimating={isAnimating}
            item={item}
            handleFeedClick={() => {
              setSelectedItem(item);
            }}
          />
        </div>
      ))}
    </div>
  );
}

function RecentFeed({ item, handleFeedClick }) {
  return (
    <div
      className="recent_travelstory_box"
      onClick={() => handleFeedClick(item)}
    >
      <img
        className="recent_travelstory_box-img"
        src={item.imagePath}
        alt="placeholder"
      />
      <div className="recent_travelstory_box-inner">
        <p className="recent_travelstory_box-title">{item.title}</p>
        <p className="recent_travelstory_box-location">{item.location}</p>
      </div>
    </div>
  );
}

function TopFeedIndivdual({
  item,
  handleFeedClick,
  isAnimating,
  selectedItem,
}) {
  return (
    <div
      className={`top_feed-box ${
        isAnimating && selectedItem.id === item.id ? "animation_image" : ""
      }`}
      onClick={() => handleFeedClick(item)}
    >
      <div className="blur-container">
        <img
          className={`top_feed-image`}
          src={item.imagePath}
          alt="background feed"
        />
      </div>
      <div className="top_feed-end">
        <h3 className="top_feed-title">{item.title}</h3>
        <div className="top_feed-end_rating">
          <img src="assets/star_front.svg" alt="full star rating" />
          <p className="top_feed-info">{item.rating}</p>
        </div>
      </div>
    </div>
  );
}

function TravelStory({ item, onClose }) {
  const [tabOpen, setTabOpen] = useState(true);

  return (
    <div className="travelstory_container">
      <div className="travelstory_background-container">
        <img
          className="travelstory_background"
          src={item.imagePath}
          alt={item.title}
        />
      </div>
      <div className="travelstory_container-start">
        <img
          src="/assets/back.svg"
          className="travelstory_container-button_back"
          onClick={onClose}
          alt="backButton"
        />

        <h2 className="travelstory_container-title_main">{item.title}</h2>
      </div>
      <div className="travelstory_container-info">
        <div className="travelstory_container-bubble">
          <div className="travelstory_container-bubble_start">
            <h2>{item.title}</h2>
            <div className="travelstory_container-location">
              <img src="assets/location.svg" alt="location" />
              <p>{item.location}</p>
            </div>
          </div>
          <div className="travelstory_container-bubble_end">
            <div className="bubble-price bubble_icons">
              <img src="assets/euro.svg" alt="star" />
              <p>{item.price}</p>
            </div>
            <div className="bubble-rate bubble_icons">
              <img src="assets/star_full.svg" alt="star" />
              <img src="assets/star_full.svg" alt="star" />
              <img src="assets/star_full.svg" alt="star" />
              <img src="assets/star_full.svg" alt="star" />
              <img src="assets/star.svg" alt="star" />
            </div>
            <div className="bubble-bookmark bubble_icons">
              <img src="assets/bookmark.svg" alt="star" />
            </div>
          </div>
        </div>
        <div className="travelstory_container-details">
          <div className="travelstory_container-details-tabs">
            <div
              onClick={() => setTabOpen(true)}
              className={`travelstory_container-details-tabs ${
                tabOpen && "tab_active"
              }`}
            >
              Place Description
            </div>
            <div
              onClick={() => setTabOpen(false)}
              className={`travelstory_container-details-tabs ${
                !tabOpen && "tab_active"
              }`}
            >
              Reviews
            </div>
          </div>

          <div className="details_tab-container">
            {tabOpen ? (
              <>
                <h3>Description</h3>
                <p>{item.info}</p>
                <p>Uploaded by {item.user}</p>
              </>
            ) : (
              <>
                <h3>Reviews</h3>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewTravelStoryButton({
  isSpinning,
  setIsSpinning,
  handleAddTravelStoryToDB,
}) {
  return (
    <div className="new_travelstory_button_container">
      <img
        id="new_travelstory_button"
        className={`new_travelstory_button ${isSpinning ? "button_spin" : ""}`}
        src="assets/plus.svg"
        alt="plus"
        onClick={() => setIsSpinning(!isSpinning)}
      />
      <img
        id="add_travelstory_button"
        className={`add_travelstory_button ${
          isSpinning ? "button_spin_add" : ""
        }`}
        src="assets/plus.svg"
        alt="plus"
        onClick={handleAddTravelStoryToDB}
      />
    </div>
  );
}

export default App;
