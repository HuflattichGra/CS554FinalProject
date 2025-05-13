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
    const { user, setUser } = useContext(userContext);
    const [username, setUsername] = useState(editUser.username);
    const [firstname, setFirstname] = useState(editUser.firstname);
    const [lastname, setLastname] = useState(editUser.lastname);
    const [bio, setBio] = useState(editUser.bio);
    const [imageFile, setImageFile] = useState<File>();


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

    /*const handleRemoveImage = (index: number) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
    };*/

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user._id !== editUser._id) {
            alert("Error: User is not authorized")
            return;
        }
        try {
            let usernameInput = document.getElementById("username") as HTMLInputElement | null
            let username = usernameInput?.value
            let firstnameInput = document.getElementById("firstname") as HTMLInputElement | null
            let firstname = firstnameInput?.value
            let lastnameInput = document.getElementById("lastname") as HTMLInputElement | null
            let lastname = lastnameInput?.value
            let bioInput = document.getElementById("bio") as HTMLInputElement | null
            let bio = bioInput?.value

            let body = {
                "username": username,
                "firstname": firstname,
                "lastname": lastname,
                "bio": bio,
                "images": imageFile,
                "imageType": "post"
            }

            let newUser = await axios.patch(`${API_BASE}/user/${editUser._id}`, body, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true  
            });
            onClose();
            onUserEdited(newUser.data); // Send Editted user to parent
        } catch (err: any) {
            onClose();
            alert("Failed to post: " + err.message);
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
                <p>Profile Picture: </p>
                <button type="button" onClick={handleAddImage}>Add</button>
                <br/>
                <button type="submit">Submit</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </form>
        </ReactModal>
    )
}

export default EditModal
