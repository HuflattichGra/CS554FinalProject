import React from 'react';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';

import PostView from '../Posts/PostView';
import PostModal from '../Posts/PostModal';
import userContext from "../../context/userContext";
import { API_BASE } from '../../api';
import styles from 'PostView.modal.css';

interface Post {
    _id: string;
    conventionID: string;
    userID: string;
    text: string;
    images: Array<string>;
    likes: Array<string>;
    createdAt: string;
    conventionName?: string;
    posterName?: string;
}

type SearchType = 'content' | 'convention' | 'poster' | null;

const POSTS_PER_PAGE = 5;

const PostList: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('poster');
    const { user } = React.useContext(userContext);

    const fetchData = async (pageNum: number = 1) => {
        try {
            const userData = await axios.get(`${API_BASE}/posts`, { withCredentials: true });
            const postsWithDetails = await Promise.all(
                userData.data.map(async (post: Post) => {
                    try {
                        // Get convention details
                        const conventionData = await axios.get(`${API_BASE}/conventions/${post.conventionID}`, { withCredentials: true });
                        // Get user details
                        const userData = await axios.get(`${API_BASE}/user/${post.userID}`, { withCredentials: true });
                        return {
                            ...post,
                            conventionName: conventionData.data.name,
                            posterName: userData.data.username
                        };
                    } catch (e) {
                        console.error('Error fetching post details:', e);
                        return post;
                    }
                })
            );

            // Sort posts by createdAt date (most recent first)
            const sortedPosts = postsWithDetails.sort((a: Post, b: Post) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setAllPosts(sortedPosts);
            filterAndSetPosts(sortedPosts, searchQuery, searchType, pageNum);
            setLoading(false);
        } catch (e) {
            console.log(e);
            setPosts([]);
            setAllPosts([]);
            setLoading(false);
        }
    };

    const filterAndSetPosts = (postsToFilter: Post[], query: string, type: SearchType, pageNum: number) => {
        const filteredPosts = query && type
            ? postsToFilter.filter(post => {
                switch (type) {
                    case 'content':
                        return post.text.toLowerCase().includes(query.toLowerCase());
                    case 'convention':
                        return post.conventionName?.toLowerCase().includes(query.toLowerCase());
                    case 'poster':
                        return post.posterName?.toLowerCase().includes(query.toLowerCase());
                    default:
                        return true;
                }
            })
            : postsToFilter;

        const startIndex = 0;
        const endIndex = pageNum * POSTS_PER_PAGE;
        const postsForPage = filteredPosts.slice(startIndex, endIndex);

        setPosts(postsForPage);
        setHasMore(endIndex < filteredPosts.length);
    };

    const handleSearch = () => {
        setPage(1);
        filterAndSetPosts(allPosts, searchQuery, searchType, 1);
    };
    const handleSearchTypeChange = (type: SearchType | string) => {
        const selectedType = type === '' ? null : type as SearchType;
        setSearchType(selectedType);
        setPage(1);
        filterAndSetPosts(allPosts, searchQuery, selectedType, 1);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        filterAndSetPosts(allPosts, searchQuery, searchType, nextPage);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
        <>{user ?
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#646cff',
                                color: 'whitesmoke',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Make a Post
                        </button>

                        <div style={{ flex: 1, display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder={searchType ? `Search by ${searchType}...` : "Search..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />

                            <select
                                value={searchType || ''}
                                onChange={(e) => handleSearchTypeChange(e.target.value as SearchType)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    backgroundColor: 'white',
                                    color: 'black'
                                }}
                            >
                                <option value="" disabled>Select search type</option>
                                <option value="poster">By Poster</option>
                                <option value="content">By Content</option>
                                <option value="convention">By Convention</option>
                            </select>

                            <button
                                onClick={handleSearch}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#646cff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div> : <></>}
            <br />
            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                    {searchQuery && searchType ? 'No posts found matching your search.' : 'No posts available.'}
                </div>
            ) : (
                <>
                    {posts.map((post: Post) => (
                        <PostView
                            key={post._id}
                            props={post}
                        />
                    ))}

                    {hasMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <button
                                onClick={loadMore}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <PostModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onPostCreated={() => {
                        setPage(1);
                        setSearchQuery('');
                        setSearchType(null);
                        fetchData(1);
                    }}
                />
            )}
        </>
    );
};

export default PostList;