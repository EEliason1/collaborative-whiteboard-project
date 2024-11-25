import React from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const authContext = React.useContext(AuthContext);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold">Collaborative Whiteboard</h1>
      {authContext?.isAuthenticated ? (
        <>
          <Link
            to="/whiteboard"
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Open Whiteboard
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 text-white bg-green-500 rounded"
          >
            Profile
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-white bg-green-500 rounded"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  );
};

export default Home;
