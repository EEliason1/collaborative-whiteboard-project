import React from "react";
import { UserContext } from "../contexts/UserContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const userContext = React.useContext(UserContext);
  const authContext = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    authContext?.logout();
    navigate("/");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-4">Username: {userContext?.user?.username}</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 text-white bg-red-500 rounded"
      >
        Logout
      </button>
      {/* Add friends and saved whiteboards list */}
    </div>
  );
};

export default Profile;
