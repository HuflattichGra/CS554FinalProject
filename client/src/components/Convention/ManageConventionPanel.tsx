import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getConventionById,
  updateConvention,
  deleteConvention,
  addPanelist,
  removePanelist,
  listAttendeeApplications,
  approveAttendeeApplication,
  rejectAttendeeApplication,
  listAttendees,
  removeAttendee,
  listPanelistApplications,
  approvePanelistApplication,
  rejectPanelistApplication
} from '../../api/conventions.ts';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge.tsx';

const ManageConventionPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [convention, setConvention] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [panelistUsername, setPanelistUsername] = useState('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [panelistApplications, setPanelistApplications] = useState<any[]>([]);
  const [attendeeApplications, setAttendeeApplications] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const data = await getConventionById(id as string);
      setConvention(data);
      setForm(data);
      const [a, pa, aa] = await Promise.all([
        listAttendees(id as string),
        listPanelistApplications(id as string),
        listAttendeeApplications(id as string)
      ]);
      setAttendees(Array.isArray(a) ? a : []);
      setPanelistApplications(Array.isArray(pa) ? pa : []);
      setAttendeeApplications(Array.isArray(aa) ? aa : []);
    } catch (e) {
      console.error('Error loading convention panel:', e);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const handleSave = async () => {
    await updateConvention(id, form);
    setEditMode(false);
    fetchData();
  };

  const handleDelete = async () => {
    await deleteConvention(id);
    navigate('/conventions');
  };

  const handleAddPanelist = async () => {
    if (!panelistUsername.trim()) return;
    await addPanelist(id, panelistUsername.trim());
    setPanelistUsername('');
    fetchData();
  };

  const handleRemovePanelist = async (userId: string) => {
    await removePanelist(id, userId);
    fetchData();
  };

  const handleRemoveAttendee = async (userId: string) => {
    await removeAttendee(id, userId);
    fetchData();
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 space-y-4">
        {/* Convention Basic Info */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Convention Details</h2>
            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Cancel' : 'Edit'}
            </Button>
          </div>
          {editMode ? (
            <div className="space-y-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" />
              <Button onClick={handleSave}>Save</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Convention</Button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold">{convention?.name}</p>
              <p className="text-muted-foreground">{convention?.description}</p>
            </div>
          )}
        </Card>

        {/* Panelists */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Manage Panelists</h3>
          <div className="flex gap-2 mt-2">
            <Input
              value={panelistUsername}
              onChange={(e) => setPanelistUsername(e.target.value)}
              placeholder="Username"
            />
            <Button onClick={handleAddPanelist}>Add Panelist</Button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {convention?.panelists?.map((p: any) => (
              <Badge key={p._id} className="flex items-center gap-2">
                {p.username}
                <Button size="sm" variant="destructive" onClick={() => handleRemovePanelist(p._id)}>x</Button>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Attendees */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Attendees</h3>
          <div className="mt-2 flex gap-2 flex-wrap">
            {attendees.map((a) => (
              <Badge key={a._id} className="flex items-center gap-2">
                {a.username}
                <Button size="sm" variant="ghost" onClick={() => handleRemoveAttendee(a._id)}>x</Button>
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Applications */}
      <div className="col-span-1 space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold">Panelist Applications</h3>
          {panelistApplications.map((u) => (
            <div key={u._id} className="flex justify-between items-center">
              <p>{u.username}</p>
              <div className="space-x-1">
                <Button onClick={() => approvePanelistApplication(id, u._id)}>Approve</Button>
                <Button variant="destructive" onClick={() => rejectPanelistApplication(id, u._id)}>Reject</Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold">Attendee Applications</h3>
          {attendeeApplications.map((u) => (
            <div key={u._id} className="flex justify-between items-center">
              <p>{u.username}</p>
              <div className="space-x-1">
                <Button onClick={() => approveAttendeeApplication(id, u._id)}>Approve</Button>
                <Button variant="destructive" onClick={() => rejectAttendeeApplication(id, u._id)}>Reject</Button>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default ManageConventionPanel;
