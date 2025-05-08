import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useContext } from "react";
import userContext from "../../context/userContext";
import axios from "axios";

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

const PostModal: React.FC<PostModalProps> = ({
    isOpen,
    onClose,
    onPostCreated,
}) => {
    const { user } = useContext(userContext);
    const [text, setText] = useState("");
    const [conventionID, setConventionID] = useState("");
    const [imageUrls, setImageUrls] = useState<string[]>([""]);

    const handleAddImage = () => setImageUrls([...imageUrls, ""]);
    const handleImageChange = (value: string, index: number) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const postData = {
                userID: user._id,
                conventionID: conventionID.trim(),
                text: text.trim(),
                images: imageUrls.filter((url) => url.trim() !== ""),
                likes: [],
            };

            await axios.post("http://localhost:3000/posts", postData);
            onClose();
            onPostCreated(); // Notify parent component to refresh posts
        } catch (err: any) {
            onClose();
            onPostCreated();
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
                    <input
                        type="text"
                        value={conventionID}
                        onChange={(e) => setConventionID(e.target.value)}
                        style={{ width: "100%", marginBottom: "1rem" }}
                    />
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
                    <p>Image URLs:</p>
                    {imageUrls.map((url, idx) => (
                        <input
                            key={idx}
                            type="text"
                            value={url}
                            onChange={(e) =>
                                handleImageChange(e.target.value, idx)
                            }
                            style={{ width: "100%", marginBottom: "0.5rem" }}
                            placeholder="https://example.com/image.jpg"
                        />
                    ))}
                    <button type="button" onClick={handleAddImage}>
                        Add Another Image
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

export default PostModal;
