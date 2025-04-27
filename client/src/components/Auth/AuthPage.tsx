import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthPage: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box bgcolor="#f5f5f5" minHeight="100vh" display="flex" justifyContent="center" alignItems="center" px={2}>
      <Box width="100%" maxWidth="1200px" mx="auto">
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, p: 4, mx: 'auto' }}>
          <Tabs value={tabIndex} onChange={handleChange} centered>
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>
          {tabIndex === 0 ? <SignInForm /> : <SignUpForm />}
        </Paper>
      </Box>
    </Box>
  );
};

export default AuthPage;