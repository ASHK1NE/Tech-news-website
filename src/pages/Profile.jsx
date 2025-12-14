import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { User, Mail, Calendar, FileText } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userArticles, setUserArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchUserArticles();
    }
  }, [currentUser]);

  const fetchUserArticles = async () => {
    try {
      const q = query(
        collection(db, 'articles'),
        where('authorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserArticles(articlesData);
    } catch (error) {
      console.error('خطا در دریافت مقالات کاربر:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            لطفا وارد شوید
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-6 space-x-reverse mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentUser.displayName}
              </h1>
              <div className="flex items-center space-x-4 space-x-reverse text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Mail size={18} />
                  <span>{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse text-blue-600 dark:text-blue-400 mb-2">
                <FileText size={20} />
                <span className="font-semibold">مقالات</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userArticles.length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse text-purple-600 dark:text-purple-400 mb-2">
                <Calendar size={20} />
                <span className="font-semibold">عضویت</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {formatDate(currentUser.metadata.creationTime)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400 mb-2">
                <User size={20} />
                <span className="font-semibold">نقش</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentUser.role === 'admin' ? 'مدیر' : 'کاربر'}
              </p>
            </div>
          </div>
        </div>

        {/* User Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            مقالات من
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : userArticles.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                هنوز مقاله‌ای ننوشته‌اید
              </p>
              <a
                href="/write"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                نوشتن اولین مقاله
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
