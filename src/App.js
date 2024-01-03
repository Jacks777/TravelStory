import { useState } from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Intro />
    </div>
  );
}

function Intro() {
  const [authOpen, setAuthOpen] = useState(false);

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
        {authOpen ? <Auth /> : <IntroMessage handleOpenAuth={handleOpenAuth} />}
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

function Auth() {
  const [login, setLogin] = useState(true);
  return (
    <>
      {login ? (
        <>
          <label>Email</label>
          <input type="email" />
          <label>Password</label>
          <input type="password" />
          <h3>Login</h3>
          <p onClick={() => setLogin(!login)}>or Register</p>
        </>
      ) : (
        <>
          <label>Username</label>
          <input type="name" />
          <label>Email</label>
          <input type="email" />
          <label>Password</label>
          <input type="password" />
          <h3>Register</h3>
          <p onClick={() => setLogin(!login)}>or Login</p>
        </>
      )}
    </>
  );
}

export default App;
