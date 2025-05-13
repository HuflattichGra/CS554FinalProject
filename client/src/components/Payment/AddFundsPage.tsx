import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userContext from '../../context/userContext';
import { API_BASE } from '../../api';
import '../ui/Create.css';
import '../ui/Input.css';
import '../ui/Button.css';
import './Payment.css';

const AddFundsPage: React.FC = () => {
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // If we have more than 2 digits, format as MM/YY
    if (v.length > 2) {
      // Extract the month part (first 2 digits)
      let month = v.substring(0, 2);
      
      // Validate month (01-12)
      const monthNum = parseInt(month);
      if (monthNum > 12) {
        month = '12'; // Cap at 12
      } else if (monthNum === 0) {
        month = '01'; // Minimum is 01
      }
      
      return `${month}/${v.substring(2, 4)}`;
    }
    
    // If only 1 digit entered and it's > 1, prefix with 0
    if (v.length === 1 && parseInt(v) > 1) {
      return `0${v}`;
    }
    
    return v;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to add funds');
      }

      // Validate expiry date
      if (expiryDate.length === 5) { // Should be in format MM/YY
        const [month, year] = expiryDate.split('/');
        const monthNum = parseInt(month);
        
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          throw new Error('Expiry month must be between 01 and 12');
        }

        // Also validate that the date is not in the past
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
        const yearNum = parseInt(year);

        if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          throw new Error('Card has expired');
        }
      } else {
        throw new Error('Invalid expiry date format (MM/YY)');
      }

      const response = await axios.post(
        `${API_BASE}/payment/addBalance`,
        {
          cardNumber,
          cardHolder,
          expiryDate,
          cvv,
          amount: parseFloat(amount)
        },
        {
          withCredentials: true
        }
      );

      setSuccess('Payment processed successfully!');
      
      // Update the user context with the new balance information
      if (response.data && response.data.user) {
        setUser(response.data.user);
      }
      
      // Clear form
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      setAmount('');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/user/${user._id}`);
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred while processing your payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="create-container">
        <h1>Add Funds</h1>
        <p>You must be logged in to add funds to your account.</p>
      </div>
    );
  }

  return (
    <div className="create-container">
      <h1>Add Funds to Your Account</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            step="0.01"
            min="1"
            required
            className="input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            className="input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cardHolder">Card Holder Name</label>
          <input
            type="text"
            id="cardHolder"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            placeholder="John Doe"
            required
            className="input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              required
              className="input"
            />
          </div>
          
          <div className="form-group half">
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
              placeholder="123"
              maxLength={3}
              required
              className="input"
            />
          </div>
        </div>
        
        <div className="button-container">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Processing...' : 'Add Funds'}
          </button>
          <button 
            type="button" 
            className="secondary-button"
            onClick={() => navigate(`/user/${user._id}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFundsPage;
