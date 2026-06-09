import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { useFormState } from '../context/FormContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { loadDraft, resetForm } = useFormState();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API_URL}/entries`);
      setEntries(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      setError('Failed to fetch previous entries. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleStartNew = () => {
    resetForm();
    navigate('/entry');
  };

  const handleResumeDraft = (entry) => {
    loadDraft(entry);
    navigate('/entry');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await axios.delete(`${API_URL}/entries/${id}`);
      setEntries(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete entry', err);
      alert('Failed to delete draft. Try again.');
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md">
      {/* Top Header */}
      <header className="bg-surface border-b border-surface-container-high h-16 flex items-center justify-between px-container-margin-mobile md:px-container-margin-desktop sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">track_changes</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:text-headline-md font-bold text-primary">
            FieldTrack Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-on-surface font-semibold">{user?.name}</p>
            <p className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-wider">{user?.employeeId}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 border border-outline-variant hover:bg-surface-container-high px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all"
          >
            Logout
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto w-full px-container-margin-mobile md:px-container-margin-desktop py-xl flex-grow">
        {/* Banner Card */}
        <section className="bg-white border border-soft-accent rounded-xl p-md md:p-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-xl shadow-sm hover:border-primary/20 transition-all">
          <div>
            <h2 className="text-headline-md font-bold text-on-surface mb-1">Welcome back, {user?.name}</h2>
            <p className="text-on-surface-variant text-body-md">
              Start a new field entry, or view and manage your drafts and submitted reports.
            </p>
          </div>
          <button
            onClick={handleStartNew}
            className="w-full md:w-auto px-6 py-3.5 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-[#8494FF] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            New Field Entry
          </button>
        </section>

        {/* Previous Entries List */}
        <section>
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Recent Field Visits</h3>
            <span className="text-label-sm bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant font-bold">
              {entries.length} Total
            </span>
          </div>

          {error && (
            <div className="p-md bg-error-container text-on-error-container rounded-xl border border-error/20 mb-md flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
              <p className="text-on-surface-variant text-label-md">Loading your field records...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white border border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-outline-variant text-5xl mb-md">storefront</span>
              <h4 className="text-body-lg font-bold text-on-surface mb-2">No visits logged yet</h4>
              <p className="text-on-surface-variant max-w-sm mb-lg">
                Get started by clicking the "New Field Entry" button to log shop details, coordinates, and uploads.
              </p>
              <button
                onClick={handleStartNew}
                className="px-6 py-2.5 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary-fixed transition-all active:scale-95"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  onClick={() => entry.status === 'Draft' ? handleResumeDraft(entry) : null}
                  className={`bg-white border rounded-xl p-md flex flex-col justify-between shadow-sm transition-all relative group ${
                    entry.status === 'Draft'
                      ? 'border-soft-accent cursor-pointer hover:border-primary-container/60 hover:shadow-md'
                      : 'border-outline-variant opacity-85'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-sm">
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        entry.status === 'Draft'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {entry.status}
                      </span>
                      <p className="text-label-sm text-on-surface-variant">
                        {new Date(entry.dateOfVisit).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Shop details */}
                    <h4 className="text-body-lg font-bold text-on-surface truncate mb-1">
                      {entry.shopDetails?.name || 'Unnamed Shop'}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mb-md">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {entry.placeOfWork || 'No location info'}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex items-center gap-md text-[12px] text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">image</span>
                        {entry.media?.images?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">mic</span>
                        {entry.media?.employeeVoiceNote ? 1 : 0 + (entry.media?.shopRepVoiceNote ? 1 : 0)}
                      </span>
                      {entry.location?.latitude && (
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          GPS Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="mt-md pt-sm border-t border-surface-container-high flex justify-between items-center">
                    <span className="text-[12px] text-brand-accent font-bold group-hover:underline">
                      {entry.status === 'Draft' ? 'Resume Draft →' : 'View Submitted'}
                    </span>
                    {entry.status === 'Draft' && (
                      <button
                        onClick={(e) => handleDelete(entry._id, e)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        title="Delete Draft"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
