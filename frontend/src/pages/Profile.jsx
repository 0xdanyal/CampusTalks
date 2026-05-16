import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, BookOpen, GraduationCap, Clock } from 'lucide-react';
import api from '../api';
import { EventCard } from '../components/EventCard';
import { PollCard } from '../components/PollCard';
import './Profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [myPolls, setMyPolls] = useState([]);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const [eventsRes, pollsRes] = await Promise.all([
          api.get('/events/my'),
          api.get('/polls/my')
        ]);
        if (eventsRes.data.success) setMyEvents(eventsRes.data.data.events || []);
        if (pollsRes.data.success) setMyPolls(pollsRes.data.data.polls || []);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    if (user) fetchMyData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="profile-container animate-fade-in">
      <div className="profile-header glass-card">
        <div className="profile-avatar">
          <UserIcon size={48} />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-regno">{user.regNo}</p>

          <div className="profile-badges">
            <span className="badge badge-primary">
              <BookOpen size={14} style={{ marginRight: '0.25rem' }} />
              {user.department}
            </span>
            <span className="badge badge-neutral">
              <GraduationCap size={14} style={{ marginRight: '0.25rem' }} />
              Batch {user.batch}
            </span>
            <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
              <Clock size={14} style={{ marginRight: '0.25rem' }} />
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="flex justify-center mb-8">
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <button
              className="btn"
              style={{
                background: activeTab === 'events' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'events' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1.5rem',
                border: 'none',
                boxShadow: activeTab === 'events' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
              }}
              onClick={() => setActiveTab('events')}
            >
              My Events ({myEvents.length})
            </button>
            <button
              className="btn"
              style={{
                background: activeTab === 'polls' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'transparent',
                color: activeTab === 'polls' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1.5rem',
                border: 'none',
                boxShadow: activeTab === 'polls' ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
              }}
              onClick={() => setActiveTab('polls')}
            >
              My Polls ({myPolls.length})
            </button>
          </div>
        </div>

        <div className="feed-content">
          {activeTab === 'events' && myEvents.length === 0 && (
            <div className="feed-empty">You haven't created any events yet.</div>
          )}
          {activeTab === 'events' && myEvents.map(event => (
            <EventCard key={event.id || event._id} event={event} onVote={() => { }} />
          ))}

          {activeTab === 'polls' && myPolls.length === 0 && (
            <div className="feed-empty">You haven't created any polls yet.</div>
          )}
          {activeTab === 'polls' && myPolls.map(poll => (
            <PollCard key={poll.id || poll._id} poll={poll} onVote={() => { }} />
          ))}
        </div>
      </div>
    </div>
  );
};
