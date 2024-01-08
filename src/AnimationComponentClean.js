import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./loading_line.json";

const AnimationComponentClean = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f6f6f6",
      }}
    >
      <Lottie style={{ width: "20vw" }} animationData={animationData} />
    </div>
  );
};

export default AnimationComponentClean;
