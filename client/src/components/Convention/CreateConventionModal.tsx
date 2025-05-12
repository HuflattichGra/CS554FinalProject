import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createConvention } from '../../api/conventions';
import { useContext } from 'react';
import userContext from '../../context/userContext';

interface CreateConventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateConventionModal: React.FC<CreateConventionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [address, setAddress] = useState('');
  const [exclusive, setExclusive] = useState(false);
  const [description, setDescription] = useState('');
  const { user } = useContext(userContext);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!user?._id) {
      alert('Missing id');
      return;
    }
    if (!name) {
      alert('Missing name');
      return;
    }
    if (!startDate) {
      alert('Missing startDate');
      return;
    }
    if (!endDate) {
      alert('Missing endDate');
      return;
    }
    if (!isOnline && !address) {
      alert('Missing isOnline && !address');
      return;
    }
    if (tags.length === 0) {
      if (tagInput.trim()) {
        tags.push(tagInput.trim());
      } else {
        alert('Missing tags');
        return;
      }
    }


    // if (!name || !startDate || !endDate || (!isOnline && !address) || tags.length === 0) {
    //   alert('Missing required fields');
    //   return;
    // }
    const formData = {
      name,
      tags,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isOnline,
      address,
      exclusive,
      description,
      ownerIds: [user?._id]
    };

    try {
      await createConvention(formData);
      onSuccess();
      onClose();
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to save convention');
      console.error('Failed to create convention', e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogClose onClick={onClose} />
      <DialogTitle>Create Convention</DialogTitle>
      <DialogContent className="space-y-4">
        <div>
          <Label>Convention Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shanghai Sword ONLY"
          />
        </div>

        <div>
          <Label>Start Date - End Date</Label>
          <div className="flex gap-2">
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              placeholderText="Start Date"
              className="w-full p-2 border rounded"
            />
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              placeholderText="End Date"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <Label>Is the convention online?</Label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={!isOnline}
                onChange={() => setIsOnline(false)}
              />{' '}
              Offline
            </label>
            <label>
              <input
                type="radio"
                checked={isOnline}
                onChange={() => setIsOnline(true)}
              />{' '}
              Online
            </label>
          </div>
        </div>

        {!isOnline && (
          <div>
            <Label>Location</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Detailed address"
            />
          </div>
        )}

        <div>
          <Label>Tags</Label>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag, press Enter"
          />
          <div className="mt-1 flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#e5e7eb',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.875rem'
                }}
              >
                #{tag}
                <button
                  onClick={() => {
                    setTags(tags.filter((_, i) => i !== idx));
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    lineHeight: 0.5
                  }}
                  aria-label={`Remove tag ${tag}`}
                >
                  &times;
                </button>
              </span>
            ))}

          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>

        <div>
          <Label>Exclusive</Label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                checked={exclusive}
                onChange={() => setExclusive(true)}
              />{' '}
              Yes
            </label>
            <label>
              <input
                type="radio"
                checked={!exclusive}
                onChange={() => setExclusive(false)}
              />{' '}
              No
            </label>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={handleSubmit}>Submit</Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateConventionModal;
