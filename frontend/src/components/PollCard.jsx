import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Trash2, Circle, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export const PollCard = ({ poll, onVote }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);

  // Calculate total votes manually just in case
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
  
  // Check if current user has voted and for which option
  const userVotedOptionId = poll.options.find(opt => opt.votes?.includes(user?._id))?._id;
  const hasVoted = !!userVotedOptionId;
  const isOwner = user?._id === poll.createdBy?._id;
  const canDelete = isOwner || user?.role === 'admin';
  
  const isExpired = new Date() > new Date(poll.expiresAt);
  const showResults = hasVoted || isExpired;

  const handleVote = async (optionId) => {
    if (voting || isExpired) return;
    setVoting(true);
    try {
      await api.post(`/polls/${poll._id || poll.id}/vote`, { optionId });
      onVote(); // Refresh
    } catch (error) {
      console.error("Vote failed", error);
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await api.delete(`/polls/${poll._id || poll.id}`);
      onVote(); // Refresh list
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="glass-card post-card animate-fade-in">
      <div className="post-header">
        <div className="post-meta">
          <span className="post-author">{poll.createdBy?.name || 'Unknown User'}</span>
          <span className="post-date">
            {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {canDelete && (
            <button className="btn-ghost action-sm" style={{ padding: '0.25rem', color: 'var(--danger)' }} onClick={handleDelete} title="Delete Poll">
              <Trash2 size={16} />
            </button>
          )}
          <div className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`}>
            <Clock size={12} style={{ marginRight: '0.25rem' }} />
            {isExpired ? 'Expired' : 'Active'}
          </div>
        </div>
      </div>

      <h3 className="post-title" style={{ marginBottom: '1.5rem' }}>{poll.question}</h3>

      <div className="poll-options">
        {poll.options.map((option) => {
          const votes = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isUserVote = option._id === userVotedOptionId;

          return (
            <div 
              key={option._id}
              className={`poll-option ${isUserVote ? 'voted' : ''}`}
              onClick={() => handleVote(option._id)}
              style={{ cursor: isExpired ? 'default' : 'pointer' }}
            >
              {showResults && (
                <div 
                  className="poll-progress" 
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="poll-option-content" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1, width: '100%' }}>
                {isUserVote ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                ) : (
                  <Circle size={18} style={{ opacity: 0.5, flexShrink: 0 }} />
                )}
                <span className="poll-option-text" style={{ flex: 1, fontWeight: isUserVote ? '600' : 'normal' }}>
                  {option.text}
                </span>
                {showResults && (
                  <span className="poll-option-percentage" style={{ fontWeight: '600' }}>{percentage}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="post-footer">
        <span className="post-date">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        <span className="post-date">
          Closes: {new Date(poll.expiresAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
