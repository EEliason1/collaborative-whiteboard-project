import React, { useState } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/signup", { username, password });
      authContext?.login();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-2 rounded w-64"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-64"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 text-white bg-green-500 rounded w-64"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
