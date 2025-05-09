import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button } from '@mui/material';
import axios from 'axios';

import { useContext } from 'react';
import UserContext from '../../context/userContext';
import { API_BASE } from '../../api';

const SignInForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${API_BASE}/login`, 
          { username, password },
          {withCredentials: true});
        console.log('Sign In Success:', response.data);

        setUser(response.data);
        navigate('/');
    } catch (error: any) {
        alert('Sign In Error:' + error.response?.data?.error || error.message)
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