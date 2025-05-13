import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useContext } from "react";
import userContext from "../../context/userContext";
import axios from "axios";
import { API_BASE } from "../../api";

ReactModal.setAppElement("#root");

interface user {
    _id: string,
    firstname: string,
    lastname: string,
    username: string,
    password: string,
    admin: boolean,
    bio: string,
    pfp?: string,
    conventionsAttending:  string[],
    bookmarks: string[],
    likes: string[],
    conventionsFollowing: string[],
    following: string[],
    followers: string[],
    balance?: number
}

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        transform: "translate(-50%, -50%)",
        width: "40%",
        backgroundColor: "#1e1e2f",
        color: "#ffffff",
        padding: "2rem",
        borderRadius: "8px",
    },
};

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserEdited: (data: user) => void;
    editUser: user;
}

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    onUserEdited,
    editUser
}) => {
    const { user } = useContext(userContext);
    const [username, setUsername] = useState(editUser.username);
    const [firstname, setFirstname] = useState(editUser.firstname);
    const [lastname, setLastname] = useState(editUser.lastname);
    const [bio, setBio] = useState(editUser.bio);
    const [imageFile, setImageFile] = useState<File | null>(null);


    const handleAddImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                setImageFile(files[0]);
            }
        };
        input.click();
    };

    const handleRemoveImage = () => {
        setImageFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user._id !== editUser._id) {
            alert("Error: User is not authorized")
            return;
        }
        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("firstname", firstname);
            formData.append("lastname", lastname);
            formData.append("bio", bio);
            
            if (imageFile) {
                formData.append("image", imageFile);
            }
            formData.append("imageType", "profile");

            let newUser = await axios.patch(`${API_BASE}/user/${editUser._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true  
            });
            onClose();
            onUserEdited(newUser.data); // Send Editted user to parent
        } catch (err: any) {
            onClose();
            alert("Failed to Edit Profile: " + err.response?.data?.error || err.message);
        }
    };

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
        >
            <h2>Edit Profile</h2>
            <form id="editUser" onSubmit={handleSubmit}>
                <label>Username: <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus={true}/></label>
                <br></br>
                <label>First Name: <input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)}/></label> 
                <label>Last Name: <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)}/></label>
                <br></br>
                <label>bio: <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{
                        width: "100%",
                        height: "80px",
                        marginTop: "8px",
                    }}/>
                </label>  
                <div>
                    <p>Profile Picture: </p>
                    {imageFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ marginRight: '1rem' }}>{imageFile.name}</span>
                            <button type="button" onClick={handleRemoveImage}>Remove</button>
                        </div>
                    ) : (
                        <p>No profile picture selected</p>
                    )}
                    <button type="button" onClick={handleAddImage}>
                        {imageFile ? 'Change Profile Picture' : 'Add Profile Picture'}
                    </button>
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <button type="submit">Submit</button>
                    <button type="button" onClick={onClose} style={{ marginLeft: "1rem" }}>Cancel</button>
                </div>
            </form>
        </ReactModal>
    )
}

export default EditModal
