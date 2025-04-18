import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import axios from 'axios';

const SignUpForm: React.FC = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
    // Uncomment the following lines to enable the API call
        /*
            const response = await axios.post('/signup', {
            firstname,
            lastname,
            username,
            password,
            });
            console.log('Sign Up Success:', response.data);
        */

    } catch (error: any) {
      console.error('Sign Up Error:', error.response?.data?.error || error.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={3}>
      <TextField
        fullWidth
        label="First Name"
        margin="normal"
        value={firstname}
        onChange={(e) => setFirstname(e.target.value)}
        required
      />
      <TextField
        fullWidth
        label="Last Name"
        margin="normal"
        value={lastname}
        onChange={(e) => setLastname(e.target.value)}
        required
      />
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
        Sign Up
      </Button>
    </Box>
  );
};

export default SignUpForm;