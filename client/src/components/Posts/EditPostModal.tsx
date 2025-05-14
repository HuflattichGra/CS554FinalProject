import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useContext } from "react";
import userContext from "../../context/userContext";
import axios from "axios";
import { API_BASE } from "../../api";
import { getEveryConvention } from "../../api/conventions";
import { useNavigate } from "react-router-dom";

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

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
    createdAt: string;
}

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostUpdated: () => void;
    post: Post;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
    isOpen,
    onClose,
    onPostUpdated,
    post
}) => {
    const navigate = useNavigate();
    const { user } = useContext(userContext);
    const [text, setText] = useState("");
    const [conventionID, setConventionID] = useState("");
    const [conventions, setConventions] = useState<{ _id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);// Initialize form with post data
    useEffect(() => {
        if (post) {
            setText(post.text);
            setConventionID(post.conventionID);
            setExistingImages(post.images || []);

            console.log("Initializing edit form with images:", post.images);

            // Generate URLs for existing images
            if (post.images && post.images.length > 0) {
                const imageUrls = post.images.map((imageId: string) =>
                    `${API_BASE}/image/download/${imageId}`
                );
                setExistingImageUrls(imageUrls);
            }
        }
    }, [post]);

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
                setNewImageFiles([...newImageFiles, files[0]]);
            }
        };
        input.click();
    };

    const handleRemoveNewImage = (index: number) => {
        const newFiles = [...newImageFiles];
        newFiles.splice(index, 1);
        setNewImageFiles(newFiles);
    };    // Remove an existing image 
    const handleRemoveExistingImage = (index: number) => {
        // Create new arrays without the removed image
        const newImages = [...existingImages];
        const newImageUrls = [...existingImageUrls];

        // Remove the image at the specified index
        newImages.splice(index, 1);
        newImageUrls.splice(index, 1);

        // Update state with the new arrays
        setExistingImages(newImages);
        setExistingImageUrls(newImageUrls);

        console.log("Image removed, remaining images:", newImages);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('text', text.trim());
            formData.append('conventionID', conventionID.trim());
            formData.append('userID', user._id); // Ensure user ID is sent for authorization

            // Add existing images that weren't removed
            // This sends only the image IDs that are still in the existingImages array
            // after the user may have removed some by clicking the X button
            existingImages.forEach(imageId => {
                formData.append('keepImages', imageId);
            });

            // Add new images
            newImageFiles.forEach(file => {
                formData.append('images', file);
            });

            formData.append('imageType', 'post');

            // If no existing images and no new images, explicitly set an empty images array
            if (existingImages.length === 0 && newImageFiles.length === 0) {
                formData.append('images', JSON.stringify([]));
            }

            console.log('Submitting updated post with:', {
                existingImages: existingImages.length,
                newImageFiles: newImageFiles.length
            });

            await axios.patch(`${API_BASE}/posts/${post._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            // Close the modal first
            onClose();
            // Then refresh the post data
            setTimeout(() => {
                onPostUpdated(); // Notify parent component to refresh post with a slight delay to ensure server processing is complete
            }, 300);
        } catch (err: any) {
            console.error("Update post error:", err);
            onClose();
            alert("Failed to update post: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try{
            var commentData = await axios.get(`${API_BASE}/comments/posts/${post._id}`, { withCredentials: true });

            for(let i=0;i<commentData.data.length;i++){
                await axios.delete(`${API_BASE}/comments/${commentData.data[i]._id}`, { withCredentials: true });
            }

            await axios.delete(`${API_BASE}/posts/${post._id}`, { withCredentials: true });
            navigate(`/posts`);
        }catch (err: any) {
            console.error("Update post error:", err);
            onClose();
            alert("Failed to update post: " + (err.response?.data?.error || err.message));
        }finally{
            setIsSaving(false);
        }
    }

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
        >
            <h2>Edit Post</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Convention:
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

                {/* Current Images Section */}
                <div style={{ marginTop: "1rem" }}>
                    <p>Current Images:</p>
                    {existingImageUrls.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                            {existingImageUrls.map((imageUrl, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '100px', marginBottom: '0.5rem' }}>
                                    <img
                                        src={imageUrl}
                                        alt={`Current image ${idx + 1}`}
                                        style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(idx)}
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            background: 'rgba(255,0,0,0.7)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: 0
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No current images</p>
                    )}
                </div>

                {/* New Images Section */}
                <div style={{ marginTop: "1rem" }}>
                    <p>Add New Images:</p>
                    {newImageFiles.length > 0 ? (
                        newImageFiles.map((file, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ marginRight: '1rem' }}>{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveNewImage(idx)}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No new images selected</p>
                    )}
                    <button
                        type="button"
                        onClick={handleAddImage}
                        style={{
                            marginTop: '0.5rem',
                            padding: '5px 10px',
                            background: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {newImageFiles.length > 0 ? 'Add Another Image' : 'Add Image'}
                    </button>
                </div>

                <div style={{ marginTop: "1.5rem", display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleDelete}
                        style={{
                            marginRight: '1em',
                            padding: '8px 16px',
                            background:'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>                    
                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            marginLeft: "1rem",
                            padding: '8px 16px',
                            background: '#4F46E5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            opacity: isSaving ? 0.7 : 1
                        }}
                    >
                        {isSaving ? 'Updating...' : 'Update'}
                    </button>
                </div>
            </form>
        </ReactModal>
    );
};

export default EditPostModal;
