import React, {useState, useEffect} from "react";
import { UserContext } from "../contexts/UserContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styled from 'styled-components';
import axios from 'axios';

const FavoritesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const FavoriteItem = styled.div`
  margin: 10px;
  border: 1px solid #ccc;
`;

const FavoriteImage = styled.img`
  width: 200px;
  height: 150px;
  object-fit: contain;
`;

const Profile: React.FC = () => {
  const userContext = React.useContext(UserContext);
  const authContext = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    authContext?.logout();
    navigate("/");
  };

  const [favorites, setFavorites] = useState<{ imageData: string; date: string }[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get('/api/user/favorites', { withCredentials: true });
        setFavorites(response.data.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

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
      <h3>Saved Whiteboards</h3>
      <FavoritesContainer>
        {favorites.map((favorite, index) => (
          <FavoriteItem key={index}>
            <FavoriteImage src={favorite.imageData} alt={`Favorite ${index + 1}`} />
            <div style={{ padding: '5px' }}>
              <p>Date Saved: {new Date(favorite.date).toLocaleString()}</p>
            </div>
          </FavoriteItem>
        ))}
      </FavoritesContainer>
    </div>
  );
};

export default Profile;
