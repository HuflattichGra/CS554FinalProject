import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import axios from 'axios';

import { useContext } from 'react';
import UserContext from '../../context/userContext';


const SignInForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //const { user, setUser } = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Uncomment the following lines to enable the API call
        /*
        const response = await axios.post('/login', { username, password });
        console.log('Sign In Success:', response.data);
        */
       //setUser(response.data)
    } catch (error: any) {
        console.error('Sign In Error:', error.response?.data?.error || error.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={3}>
      <TextField
        fullWidth
        label="Username"
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
        Sign In
      </Button>
    </Box>
  );
};

export default SignInForm;