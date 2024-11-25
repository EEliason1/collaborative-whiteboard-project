import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

interface UserType {
  id: string;
  username: string;
  friends: string[];
  savedWhiteboards: string[];
}

interface UserContextType {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/user/profile");
        setUser(response.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
