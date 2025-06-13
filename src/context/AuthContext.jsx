import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
    fetch('http://localhost/elder-dB/check_session.php', {
      credentials: 'include' 
    })
      .then((res) => {
        console.log('Response status:', res.status); 
        return res.json();
      })
      .then((data) => {
        console.log('Check session response:', data);

        if (data.success) {
          setUser(data.user);
          console.log('Logged-in user:', data.user);

          if (data.user.role) {
            console.log('User type:', data.user.role);
          }
          if (data.user.name) {
            console.log('User name:', data.user.name);
          }
          if (data.user.image) {
            console.log('User image:', data.user.image);
          }
        } else {
          setUser(null);
          console.log('No active session, user data cleared');
        }
      })
      .catch((error) => {
        setUser(null);
        console.error('Error checking session:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  const login = (userData) => {
    if (!userData || !userData.username) {
      console.error('Invalid user data:', userData);
      return;
    }
  
    setUser(userData);
    console.log('User logged in:', userData);

    fetch('http://localhost/elder-dB/check_session.php', {
      method: 'POST',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log('Session re-check after login:', data);
      })
      .catch(err => console.error('Check session error:', err));

    // Log additional user details
    if (userData.type) {
      console.log('User typeTEST:', userData.type);
    }
    if (userData.username) {
      console.log('User name:', userData.username);
    }
    if (userData.image) {
      console.log('User image:', userData.image);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); 

    fetch("http://localhost/elder-dB/logout.php", {
      method: "POST",
      credentials: "include" 
    })
      .then(() => {
        setUser(null); 
        console.log('User logged out');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
