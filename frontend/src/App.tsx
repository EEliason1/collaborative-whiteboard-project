import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Whiteboard from "./components/Whiteboard";
import ProtectedRoute from "./routes/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/whiteboard"
              element={
                <ProtectedRoute>
                  <Whiteboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
