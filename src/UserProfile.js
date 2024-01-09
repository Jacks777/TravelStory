import "./userProfile.css";
import { useParams } from "react-router-dom";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function UserProfile({
  setIsUserProfileOpened,
  userDataLocal,
  handleOpenUserProfile,
}) {
  return (
    <div className="userprofile_container">
      <div className="userprofile_container-inner">
        <Link to={`/`} onClick={() => handleOpenUserProfile()}>
          Home
        </Link>
        <div className="userprofile_container-top">
          <img
            className="userprofile_container-top_img"
            src={userDataLocal.profilePicture}
            alt="profile"
          />
        </div>

        <div className="userprofile_container-mid">
          <h2 className="userprofile_container-top_username">
            {userDataLocal.username}
          </h2>
          <div className="userprofile_container-top_info">
            <p>{userDataLocal.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
