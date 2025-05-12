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
    addAttendee,
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
import { Label } from '../ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    const [tagInput, setTagInput] = useState('');
    const [attendeeUsername, setAttendeeUsername] = useState('');


    const fetchData = async () => {
        try {
            const data = await getConventionById(id as string);
            setConvention(data);
            setForm(data);
            const { attendees } = await listAttendees(id as string);
            const [a, pa, aa] = await Promise.all([
                listAttendees(id as string),
                listPanelistApplications(id as string),
                listAttendeeApplications(id as string)
            ]);
            setAttendees(attendees.map((u, i) => ({
                ...u,
                _id: u._id?.$oid || u._id?.toString?.() || `attendee-${i}`
              })));
              
              
            setPanelistApplications(Array.isArray(pa) ? pa : []);
            setAttendeeApplications(Array.isArray(aa) ? aa : []);
        } catch (e) {
            alert('Failed to load convention panel');
            console.error('Error loading convention panel:', e);
        }
    };



    const handleSave = async () => {
        try {
            await updateConvention(id, form);
            setEditMode(false);
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to save convention');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteConvention(id);
            navigate('/conventions');
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to delete convention');
        }
    };

    const handleAddPanelist = async () => {
        if (!panelistUsername.trim()) return;
        try {
            await addPanelist(id, panelistUsername.trim());
            setPanelistUsername('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to add panelist');
        }
    };

    const handleRemovePanelist = async (userId: string) => {
        try {
            await removePanelist(id, userId);
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to remove panelist');
        }
    };
    const handleAddAttendee = async () => {
        if (!attendeeUsername.trim()) return;

        try {
            await addAttendee(id, attendeeUsername.trim());
            setAttendeeUsername('');
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to add attendee');
        }
    };

    const handleRemoveAttendee = async (userId: string) => {
        try {
            await removeAttendee(id, userId);
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert(e?.response?.data?.error || 'Failed to remove attendee');
        }
    };


    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
            setTagInput('');
            e.preventDefault();
        }
    };
    useEffect(() => {
        if (id) fetchData();
    }, [id]);
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
                            <div>
                                <Label>Name</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Shanghai Sword ONLY"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Description"
                                />
                            </div>
                            <div>
                                <Label>Start Date - End Date</Label>
                                <div className="flex gap-2">
                                    <DatePicker
                                        selected={form.startDate ? new Date(form.startDate) : null}
                                        onChange={(date) => setForm({ ...form, startDate: date })}
                                        placeholderText="Start Date"
                                        className="w-full p-2 border rounded"
                                    />
                                    <DatePicker
                                        selected={form.endDate ? new Date(form.endDate) : null}
                                        onChange={(date) => setForm({ ...form, endDate: date })}
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
                                            checked={!form.isOnline}
                                            onChange={() => setForm({ ...form, isOnline: false })}
                                        />{' '}
                                        Offline
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            checked={form.isOnline}
                                            onChange={() => setForm({ ...form, isOnline: true })}
                                        />{' '}
                                        Online
                                    </label>
                                </div>
                            </div>
                            {!form.isOnline && (
                                <div>
                                    <Label>Location</Label>
                                    <Input
                                        value={form.address || ''}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                                    {(form.tags || []).map((tag: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-sm"
                                        >
                                            #{tag}
                                            <button
                                                onClick={() => {
                                                    setForm({
                                                        ...form,
                                                        tags: form.tags.filter((_: string, i: number) => i !== idx)
                                                    });
                                                }}
                                                className="text-gray-600 hover:text-red-500"
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>Exclusive</Label>
                                <div className="flex gap-4">
                                    <label>
                                        <input
                                            type="radio"
                                            checked={form.exclusive === true}
                                            onChange={() => setForm({ ...form, exclusive: true })}
                                        />{' '}
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            checked={form.exclusive === false}
                                            onChange={() => setForm({ ...form, exclusive: false })}
                                        />{' '}
                                        No
                                    </label>
                                </div>
                            </div>
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
                    <h3 className="text-lg font-semibold">Manage Attendees</h3>
                    <div className="flex gap-2 mt-2">
                        <Input
                            value={attendeeUsername}
                            onChange={(e) => setAttendeeUsername(e.target.value)}
                            placeholder="Username"
                        />
                        <Button onClick={handleAddAttendee}>Add Attendee</Button>
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                        {attendees.map((a) => (
                            <Badge key={a._id} className="flex items-center gap-2">
                                {a.username}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveAttendee(a._id?.$oid || a._id)}
                                >
                                    x
                                </Button>
                            </Badge>

                        ))}
                    </div>
                </Card>

            </div>

            {/* Applications
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
            </div> */}
        </div>
    );
};

export default ManageConventionPanel;
