import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, User } from 'lucide-react';

const CommentSection = ({ articleId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return unsubscribe;
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('برای نظر دادن باید وارد شوید');
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId,
        content: newComment,
        authorId: currentUser.uid,
        authorName: currentUser.displayName,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (error) {
      console.error('خطا در ارسال نظر:', error);
      alert('خطا در ارسال نظر');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('آیا مطمئن هستید؟')) {
      try {
        await deleteDoc(doc(db, 'comments', commentId));
      } catch (error) {
        console.error('خطا در حذف نظر:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        نظرات ({comments.length})
      </h3>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="نظر خود را بنویسید..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="4"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'در حال ارسال...' : 'ارسال نظر'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            برای ارسال نظر ابتدا وارد شوید
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            هنوز نظری ثبت نشده است
          </p>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {comment.authorName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                {currentUser && currentUser.uid === comment.authorId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
