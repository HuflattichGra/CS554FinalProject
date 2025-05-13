import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useContext } from "react";
import userContext from "../../context/userContext";
import axios from "axios";
import { API_BASE } from "../../api";
import { getEveryConvention } from "../../api/conventions";
import { useParams } from "react-router-dom";

ReactModal.setAppElement("#root");

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

interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
    isOpen,
    onClose,
    onPostCreated,
}) => {
    const { user } = useContext(userContext);
    const [text, setText] = useState("");
    const postID : any = useParams().id;

    useEffect(() => {
        
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const formData = {
            'text':text.trim(),
            'postID': postID,
            'userID': user._id,
            }            
            await axios.post(`${API_BASE}/comments`,formData);
            onClose();
            onPostCreated(); // Notify parent component to refresh posts
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
            <h2>New Post</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Text:
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            height: "80px",
                            marginTop: "8px",
                        }}
                    />
                </label>

                <div style={{ marginTop: "1rem" }}>
                    <button type="button" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" style={{ marginLeft: "1rem" }}>
                        Post
                    </button>
                </div>
            </form>
        </ReactModal>
    );
};

export default CommentModal;
