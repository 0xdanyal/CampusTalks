import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowBigUp, ArrowBigDown, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CreatePostModal } from './CreatePostModal';

export const EventCard = ({ event, onVote }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if current user has upvoted/downvoted
  const isUpvoted = event.upvotes.includes(user?._id);
  const isDownvoted = event.downvotes.includes(user?._id);
  const isOwner = user?._id === event.createdBy?._id;
  const canDelete = isOwner || user?.role === 'admin';

  const handleVote = async (voteType) => {
    if (voting) return;
    setVoting(true);
    try {
      await api.post(`/events/${event._id || event.id}/vote`, { voteType });
      onVote(); // Refresh data
    } catch (error) {
      console.error("Vote failed", error);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${event._id || event.id}`);
      onVote(); // Refresh data
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="glass-card post-card animate-fade-in">
      <div className="post-header">
        <div className="post-meta">
          <span className="post-author">{event.createdBy?.name || 'Unknown User'}</span>
          <span className="post-date">
            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
          </span>
        </div>
        {(isOwner || user?.role === 'admin') && (
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            {isOwner && (
              <button className="btn-ghost action-sm" style={{ padding: '0.25rem' }} onClick={() => setIsEditModalOpen(true)} title="Edit Event">
                <Edit size={16} />
              </button>
            )}
            <button className="btn-ghost action-sm" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={handleDelete} title="Delete Event">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <h3 className="post-title">{event.title}</h3>
      <p className="post-body">{event.description}</p>

      {/* Event Details (Location/Date) */}
      {(event.location || event.eventDate) && (
        <div className="flex flex-col gap-2 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {event.location && (
            <div className="badge badge-neutral" style={{ width: 'fit-content' }}>
              <MapPin size={14} style={{ marginRight: '0.25rem' }} />
              {event.location}
            </div>
          )}
          {event.eventDate && (
            <div className="badge badge-primary" style={{ width: 'fit-content' }}>
              <Calendar size={14} style={{ marginRight: '0.25rem' }} />
              {new Date(event.eventDate).toLocaleDateString()} {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="post-tags">
          {event.tags.map(tag => (
            <span key={tag} className="badge badge-neutral">#{tag}</span>
          ))}
        </div>
      )}

      <div className="post-footer">
        <div className="post-actions">
          <button 
            className={`action-btn ${isUpvoted ? 'active-up' : ''}`}
            onClick={() => handleVote('up')}
            disabled={voting}
          >
            <ArrowBigUp size={20} fill={isUpvoted ? 'currentColor' : 'none'} />
            <span>{event.upvoteCount || event.upvotes?.length || 0}</span>
          </button>
          
          <button 
            className={`action-btn ${isDownvoted ? 'active-down' : ''}`}
            onClick={() => handleVote('down')}
            disabled={voting}
          >
            <ArrowBigDown size={20} fill={isDownvoted ? 'currentColor' : 'none'} />
            <span>{event.downvoteCount || event.downvotes?.length || 0}</span>
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <CreatePostModal 
          editEvent={event}
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            setIsEditModalOpen(false);
            onVote();
          }}
        />
      )}
    </div>
  );
};
