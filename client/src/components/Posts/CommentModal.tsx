import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useContext } from "react";
import userContext from "../../context/userContext";
import axios from "axios";
import { API_BASE } from "../../api";
import { getEveryConvention } from "../../api/conventions";

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

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

const CommentModal: React.FC<PostModalProps> = ({
    isOpen,
    onClose,
    onPostCreated,
}) => {
    const { user } = useContext(userContext);
    const [text, setText] = useState("");
    const [conventionID, setConventionID] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [conventions, setConventions] = useState<{ _id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchConventions = async () => {
            setIsLoading(true);
            try {
                const data = await getEveryConvention();
                setConventions(data);
            } catch (error) {
                console.error("Failed to fetch conventions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConventions();
    }, []);

    const handleAddImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                setImageFiles([...imageFiles, files[0]]);
            }
        };
        input.click();
    };

    const handleRemoveImage = (index: number) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const formData = new FormData();
            formData.append('text', text.trim());
            formData.append('conventionID', conventionID.trim());
            formData.append('userID', user._id);
            
            imageFiles.forEach((file) => {
                formData.append('images', file);
            });
            formData.append("imageType", "post");

            await axios.post(`${API_BASE}/posts`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
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
                    Convention ID:
                    <select
                        value={conventionID}
                        onChange={(e) => setConventionID(e.target.value)}
                        style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
                        required
                    >
                        <option value="">Select a convention</option>
                        {isLoading ? (
                            <option disabled>Loading conventions...</option>
                        ) : (
                            conventions.map((convention) => (
                                <option key={convention._id} value={convention._id}>
                                    {convention.name}
                                </option>
                            ))
                        )}
                    </select>
                </label>
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

                <div>
                    <p>Images:</p>
                    {imageFiles.length > 0 ? (
                        imageFiles.map((file, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ marginRight: '1rem' }}>{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No images selected</p>
                    )}
                    <button type="button" onClick={handleAddImage}>
                        {imageFiles.length > 0 ? 'Add Another Image' : 'Add Image'}
                    </button>
                </div>

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
