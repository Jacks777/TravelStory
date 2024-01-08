import React from "react";
import Lottie from "lottie-react";
import animationData from "./loading_line.json";

const AnimationComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <Lottie style={{ width: "20vw" }} animationData={animationData} />
    </div>
  );
};

export default AnimationComponent;
