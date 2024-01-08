import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./loading_line.json";

const AnimationComponent = () => {
  const factsArray = [
    {
      fact: "The world’s longest commercial flight took around 30 hours.",
    },
    {
      fact: "The shortest commercial flight takes less than two minutes.",
    },
    {
      fact: "Japanese railways hand out ‘certificates’ for delays of more than five minutes.",
    },
    {
      fact: "India’s trains transport roughly 23 million passengers each day.",
    },
    {
      fact: "Saudi Arabia has no rivers.",
    },
    {
      fact: "Banana is a popular pizza topping in Sweden.",
    },
    {
      fact: "Despite what people say, the Great Wall of China is not visible from space.",
    },
    {
      fact: "Sudan has more ancient pyramids than Egypt.",
    },
  ];

  const [randomFact, setRandomFact] = useState(
    factsArray[Math.floor(Math.random() * factsArray.length)]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomFact(factsArray[Math.floor(Math.random() * factsArray.length)]);
    }, 5000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [factsArray]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        backgroundColor: "#f6f6f6",
      }}
    >
      <Lottie style={{ width: "20vw" }} animationData={animationData} />
      <div>
        <h2
          style={{ fontWeight: "400", textAlign: "center", marginTop: "5vw" }}
        >
          #TravelFacts
        </h2>
        <h3
          style={{
            fontWeight: "400",
            textAlign: "center",
            marginTop: "5vw",
            transition: "0.3s all",
          }}
        >
          {randomFact.fact}
        </h3>
      </div>
    </div>
  );
};

export default AnimationComponent;
