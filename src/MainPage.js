import { useState } from "react";
import { ref, push, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { databaseInstance, storageInstance } from "./config";
import AnimationComponent from "./AnimationComponent";
import {
  TravelStory,
  TopBar,
  Feed,
  AddTravelStory,
  NewTravelStoryButton,
} from "./App";

export function MainPage({
  isLoggedIn,
  isFinished,
  setIsFinished,
  profilePictureLocal,
  handleLogout,
  usernameLocal,
  userDataLocal,
  handleOpenUserProfile,
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
                handleOpenUserProfile={handleOpenUserProfile}
                handleLogout={handleLogout}
                profilePictureLocal={profilePictureLocal}
                userDataLocal={userDataLocal}
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
