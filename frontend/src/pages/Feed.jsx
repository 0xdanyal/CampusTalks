import { useState, useEffect } from 'react';
import api from '../api';
import { EventCard } from '../components/EventCard';
import { PollCard } from '../components/PollCard';
import { CreatePostModal } from '../components/CreatePostModal';
import { PlusCircle } from 'lucide-react';
import './Feed.css';

export const Feed = () => {
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'polls'
  const [events, setEvents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const fetchPolls = async () => {
    try {
      const res = await api.get('/polls');
      if (res.data.success) {
        setPolls(res.data.data.polls || []);
      }
    } catch (error) {
      console.error("Failed to fetch polls", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'events') {
      fetchEvents().finally(() => setLoading(false));
    } else {
      fetchPolls().finally(() => setLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="feed-container animate-fade-in">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center w-full" style={{ flexWrap: 'wrap', gap: '1rem' }}>
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
              Events
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
              Polls
            </button>
          </div>
        </div>
      </div>
        
        <div className="flex justify-end" style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.5rem' }}>
            <PlusCircle size={18} />
            <span>Create Post</span>
          </button>
        </div>

      <div className="feed-content">
        {loading ? (
          <div className="feed-loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'events' && events.length === 0 && (
              <div className="feed-empty">No events found. Be the first to create one!</div>
            )}
            
            {activeTab === 'events' && events.map((event) => (
              <EventCard key={event.id} event={event} onVote={fetchEvents} />
            ))}

            {activeTab === 'polls' && polls.length === 0 && (
              <div className="feed-empty">No polls found. Start a conversation!</div>
            )}
            
            {activeTab === 'polls' && polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} onVote={fetchPolls} />
            ))}
          </>
        )}
      </div>

      {isModalOpen && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            if (activeTab === 'events') fetchEvents();
            else fetchPolls();
          }}
        />
      )}
    </div>
  );
};
