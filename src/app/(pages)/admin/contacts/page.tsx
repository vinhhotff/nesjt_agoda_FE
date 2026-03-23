'use client';

import { useState, useEffect } from 'react';
import { Contact, getContacts, getContactStats, acceptContact, rejectContact, replyContact, deleteContact } from '@/src/lib/api/contactApi';
import { toast } from 'react-toastify';
import { 
  MessageSquare, 
  Search, 
  CheckCircle, 
  XCircle, 
  Reply, 
  Trash2, 
  Clock,
  Check,
  X,
  Mail,
  Phone,
  User,
  Eye,
  Send
} from 'lucide-react';
import Modal from '@/src/components/ui/Modal';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import { LoadingSpinner } from '@/src/components/ui';

type ContactStatus = 'pending' | 'read' | 'replied' | 'closed';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0, closed: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [page, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getContacts(page, 10, statusFilter || undefined);
      setContacts(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getContactStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      setActionLoading(true);
      await acceptContact(id);
      toast.success('Contact marked as read');
      fetchContacts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to accept contact');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContact) return;
    try {
      setActionLoading(true);
      await rejectContact(selectedContact._id, rejectReason);
      toast.success('Contact rejected');
      setShowRejectModal(false);
      setSelectedContact(null);
      setRejectReason('');
      fetchContacts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to reject contact');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) return;
    try {
      setActionLoading(true);
      await replyContact(selectedContact._id, replyMessage);
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setSelectedContact(null);
      setReplyMessage('');
      fetchContacts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact(id);
      toast.success('Contact deleted');
      fetchContacts();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ContactStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      read: 'bg-blue-100 text-blue-800 border-blue-300',
      replied: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    const labels = {
      pending: 'Pending',
      read: 'Read',
      replied: 'Replied',
      closed: 'Closed',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading && contacts.length === 0) {
    return (
      <AdminLayout>
        <LoadingSpinner size="lg" text="Loading contacts..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Contact Management"
          description="Manage customer inquiries and messages"
          icon={<MessageSquare className="w-6 h-6 text-white" />}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, subject or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ContactStatus | '');
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contacts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {contact.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {contact.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-medium">{contact.subject}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{contact.message}</p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(contact.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(contact.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {contact.status === 'pending' && (
                            <button
                              onClick={() => handleAccept(contact._id)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowReplyModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowRejectModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Contact Modal */}
      {selectedContact && !showReplyModal && !showRejectModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedContact(null)}
          title="Contact Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{selectedContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedContact.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subject</label>
              <p className="text-gray-900 font-medium">{selectedContact.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="bg-gray-50 rounded-lg p-4 mt-1">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>
            {selectedContact.replyMessage && (
              <div>
                <label className="text-sm font-medium text-gray-500">Admin Reply</label>
                <div className="bg-green-50 rounded-lg p-4 mt-1">
                  <p className="text-green-900 whitespace-pre-wrap">{selectedContact.replyMessage}</p>
                  {selectedContact.repliedAt && (
                    <p className="text-xs text-green-700 mt-2">
                      Replied at: {new Date(selectedContact.repliedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-500">
                Submitted: {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowReplyModal(false);
            setReplyMessage('');
          }}
          title="Reply to Contact"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">To: {selectedContact.email}</p>
              <p className="text-sm text-gray-500">Subject: {selectedContact.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Type your reply here..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyMessage.trim() || actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedContact && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowRejectModal(false);
            setRejectReason('');
          }}
          title="Reject Contact"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800">Are you sure you want to reject this contact?</p>
              <p className="text-red-600 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter reason for rejection..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
