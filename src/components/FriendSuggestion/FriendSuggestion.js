import React from 'react';
import { useFriends } from '../../context/FriendsContext';
import './FriendSuggestion.css';

const FriendSuggestion = () => {
  const { getFriendSuggestions, sendFriendRequest } = useFriends();
  const suggestions = getFriendSuggestions().slice(0, 2);

  const handleAddFriend = (friendId, friendName) => {
    sendFriendRequest(friendId, friendName);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="friend-suggestion-widget">
      <h3>Sugerencias de amistad</h3>
      <div className="suggestions-list">
        {suggestions.map((friend) => (
          <div key={friend.id} className="suggestion-card">
            <img src={friend.avatar} alt={friend.name} />
            <div className="suggestion-info">
              <h4>{friend.name}</h4>
              <p>{friend.location || 'Vecino Activo'}</p>
            </div>
            <button 
              className="add-friend-btn"
              onClick={() => handleAddFriend(friend.id, friend.name)}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSuggestion;
