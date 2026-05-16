import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../api';
import './Modal.css';

export const CreatePostModal = ({ onClose, onSuccess, editEvent }) => {
  const [type, setType] = useState(editEvent ? 'event' : 'event'); // 'event' | 'poll'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Event State
  const [eventData, setEventData] = useState({
    title: editEvent?.title || '', 
    description: editEvent?.description || '', 
    location: editEvent?.location || '', 
    eventDate: editEvent?.eventDate ? new Date(editEvent.eventDate).toISOString().slice(0, 16) : '', 
    tags: editEvent?.tags?.join(', ') || ''
  });

  // Poll State
  const [pollData, setPollData] = useState({
    question: '', options: ['', ''], expiresAt: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'event') {
        const payload = {
          ...eventData,
          tags: eventData.tags ? eventData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        };
        // Clean empty optional fields
        if (!payload.eventDate) delete payload.eventDate;
        else payload.eventDate = new Date(payload.eventDate).toISOString();
        
        if (editEvent) {
          await api.patch(`/events/${editEvent._id || editEvent.id}`, payload);
        } else {
          await api.post('/events', payload);
        }
      } else {
        const payload = {
          question: pollData.question,
          options: pollData.options.filter(o => o.trim() !== ''),
          expiresAt: new Date(pollData.expiresAt).toISOString()
        };
        await api.post('/polls', payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
      if (err.response?.data?.data) {
        // Detailed validation errors
        setError(JSON.stringify(err.response.data.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const addPollOption = () => {
    if (pollData.options.length < 6) {
      setPollData({ ...pollData, options: [...pollData.options, ''] });
    }
  };

  const removePollOption = (index) => {
    if (pollData.options.length > 2) {
      const newOptions = [...pollData.options];
      newOptions.splice(index, 1);
      setPollData({ ...pollData, options: newOptions });
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2 className="modal-title">{editEvent ? 'Edit Event' : 'Create New Post'}</h2>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '0.25rem' }}>
            <X size={24} />
          </button>
        </div>

        {!editEvent && (
          <div className="modal-tabs">
            <button 
              className={`modal-tab ${type === 'event' ? 'active' : ''}`}
              onClick={() => setType('event')}
            >
              Event
            </button>
            <button 
              className={`modal-tab ${type === 'poll' ? 'active' : ''}`}
              onClick={() => setType('poll')}
            >
              Poll
            </button>
          </div>
        )}

        {error && <div className="input-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {type === 'event' ? (
            <>
              <div className="input-group">
                <label className="input-label">Title *</label>
                <input 
                  className="input-field" required minLength={3} maxLength={120}
                  value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea 
                  className="input-field" required minLength={10} maxLength={2000} rows={4}
                  value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input 
                  className="input-field" placeholder="Optional"
                  value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Event Date & Time</label>
                <input 
                  type="datetime-local" className="input-field"
                  value={eventData.eventDate} onChange={e => setEventData({...eventData, eventDate: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Tags (comma separated)</label>
                <input 
                  className="input-field" placeholder="sports, coding, party"
                  value={eventData.tags} onChange={e => setEventData({...eventData, tags: e.target.value})}
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label className="input-label">Question *</label>
                <input 
                  className="input-field" required minLength={5} maxLength={300}
                  value={pollData.question} onChange={e => setPollData({...pollData, question: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Options * (2-6)</label>
                {pollData.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      className="input-field" style={{ flex: 1 }} required
                      value={opt} onChange={e => handlePollOptionChange(i, e.target.value)}
                    />
                    {pollData.options.length > 2 && (
                      <button type="button" className="btn btn-danger" onClick={() => removePollOption(i)} style={{ padding: '0 0.75rem' }}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {pollData.options.length < 6 && (
                  <button type="button" className="btn btn-secondary" onClick={addPollOption} style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                    <Plus size={16} /> Add Option
                  </button>
                )}
              </div>
              <div className="input-group">
                <label className="input-label">Expires At *</label>
                <input 
                  type="datetime-local" className="input-field" required
                  value={pollData.expiresAt} onChange={e => setPollData({...pollData, expiresAt: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="modal-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
