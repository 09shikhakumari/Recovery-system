import React, { useState } from 'react';
import { Course, PeerContact } from '../types';
import { X, UserPlus, Copy, Check, MessageSquare, Share2, Award } from 'lucide-react';

interface PeerNetworkModalProps {
  courses: Course[];
  contacts: PeerContact[];
  onClose: () => void;
  onAddContact: (contact: PeerContact) => void;
}

export const PeerNetworkModal: React.FC<PeerNetworkModalProps> = ({
  courses,
  contacts,
  onClose,
  onAddContact,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [contactInfo, setContactInfo] = useState('');

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddContact({
      id: `peer-${Date.now()}`,
      name: name.trim(),
      courseId,
      contact: contactInfo.trim() || 'Classroom / GroupMe',
      notesSharedCount: 0,
      notesReceivedCount: 1,
    });

    setName('');
    setContactInfo('');
    setShowAddForm(false);
  };

  const copyQuickRequest = (peerName: string, courseCode: string, idx: number) => {
    const text = `Hey ${peerName}! I had to miss ${courseCode} lecture today. Would you be open to sharing your notes or slides annotations? Happy to share mine anytime or send over my study guide in return!`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Peer Notes & Study Buddy Network</h2>
            <p className="text-xs text-slate-300">
              Coordinate note sharing, track reciprocal academic karma, and generate quick text prompts.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Active classmate study partners: <strong className="text-slate-900">{contacts.length}</strong>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Study Buddy</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-800">Add New Peer Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Classmate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shared Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Handle (Email / Discord / Phone)</label>
                <input
                  type="text"
                  placeholder="e.g. maya@univ.edu or @maya_notes"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg"
                >
                  Save Partner
                </button>
              </div>
            </form>
          )}

          {/* Contact Cards */}
          <div className="space-y-3">
            {contacts.map((contact, idx) => {
              const course = courses.find((c) => c.id === contact.courseId);

              return (
                <div
                  key={contact.id}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{contact.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {course?.code || 'General'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{contact.contact}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                      <span className="text-indigo-600 font-semibold">{contact.notesSharedCount} shared</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-semibold">{contact.notesReceivedCount} received</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyQuickRequest(contact.name, course?.code || 'class', idx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Prompt Copied!</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Copy Request SMS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
