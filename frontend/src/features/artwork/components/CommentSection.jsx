import React, { useState, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Typography, message } from 'antd';
import { UserOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { artwork } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './CommentSection.css';

const { TextArea } = Input;
const { Text } = Typography;

const CommentSection = ({ artworkId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchComments();
    }, [artworkId]);

    const fetchComments = async () => {
        try {
            const response = await artwork.getComments(artworkId);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSubmit = async () => {
        if (!user || !user.user) {
            message.info('Please login first');
            navigate('/auth');
            return;
        }

        if (!newComment.trim()) {
            message.warning('Comment content cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const response = await artwork.addComment(artworkId, {
                comment: newComment
            });
            
            setComments([response.data, ...comments]);
            setNewComment('');
            message.success('Comment posted successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            message.error('Comment posting failed, please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
                <TextArea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Comment here..."
                    maxLength={500}
                    className="comment-textarea"
                />
                <Button 
                    className="comment-button"
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={loading}
                >
                    Post 
                </Button>
            </div>

            <List
                itemLayout="horizontal"
                dataSource={comments}
                renderItem={comment => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    linkto={`/profile/${comment.username}`}
                                    src={comment.user_profile_picture} 
                                    icon={!comment.user_profile_picture && <UserOutlined />}
                                />
                            }
                            title={<Text strong><Link to={`/profile/${comment.username}`}>{comment.username}</Link></Text>}
                            description={
                                <div>
                                    <div>{comment.comment}</div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {new Date(comment.created_at).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: undefined,
                                            hour12: false
                                        })}
                                    </Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default CommentSection;
