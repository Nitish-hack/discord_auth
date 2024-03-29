import React from 'react';
import axios from 'axios';


function App() {
  const BASE_URI="http://localhost:5000"
  const handleClick = async () => {
    try {
      window.location.href = `${BASE_URI}/discord`; 
    } catch (error) {
      console.error('Error logging in with Discord:', error);
    }
  };

  const handleReset = async () => {
    try {
      const response = await axios.get(`${BASE_URI}/api/remove-cookies`, {
        withCredentials: true 
      });
      
      console.log('Cookies reset successfully.');
    } catch (error) {
      console.error('Error resetting cookies:', error);
    }
  };

  return (
    <div>
      <button style={{background:"purple",color:"white",cursor:"pointer"}}  onClick={handleClick}>LOGIN WITH DISCORD</button>
      <br />
      <br />
      <button style={{background:"red",color:"white",cursor:"pointer"}} onClick={handleReset} >RESET COOKIE </button>
    </div>
  );
}

export default App;
