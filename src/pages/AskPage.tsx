import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { EyeOff, Globe, HelpCircle, ArrowLeft } from 'lucide-react';
import { Category } from '../core/models/types';
import { categoryService } from '../core/services/categoryService';
import { questionService } from '../core/services/questionService';
import { useAuth } from '../core/context/AuthContext';

export const AskPage: React.FC = () => {
  const { currentUser, userProfile, userPrivate } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getAllCategories()
      .then((cats) => {
        setCategories(cats);
        const preselected = searchParams.get('category');
        if (preselected && cats.some((c) => c.slug === preselected)) {
          setSelectedCategorySlug(preselected);
        } else if (cats.length > 0) {
          setSelectedCategorySlug(cats[0].slug);
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories:', err);
      });

    if (userPrivate?.defaultAnonymous) {
      setIsAnonymous(true);
    }
  }, [searchParams, userPrivate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be signed in to post a question.');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (body.trim().length < 10) {
      setError('Body description must be at least 10 characters long.');
      return;
    }

    const matchedCat = categories.find((c) => c.slug === selectedCategorySlug);
    if (!matchedCat) {
      setError('Please select a valid category.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter((t) => t.length > 0)
        .slice(0, 5);

      const qId = await questionService.createQuestion({
        title: title.trim(),
        body: body.trim(),
        categoryId: matchedCat.slug,
        categoryName: matchedCat.name,
        tagIds: tags,
        isAnonymous,
        authorUid: currentUser.uid,
        authorDisplayName: userProfile?.displayName || 'Member',
        authorUsername: userProfile?.username || 'user',
        authorPhotoUrl: userProfile?.photoUrl
      });

      navigate(`/question/${qId}`);
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-4">
        <HelpCircle className="w-10 h-10 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-display">
          Authentication Required
        </h2>
        <p className="text-xs text-neutral-500 leading-relaxed">
          To maintain community integrity and protect against abuse, you must sign in before posting a question. You may still choose to post anonymously.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/login?redirect=/ask"
            className="w-full py-2.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl"
          >
            Sign In
          </Link>
          <Link
            to="/signup?redirect=/ask"
            className="w-full py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
            Ask a Question
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Frame your question clearly to invite detailed, thoughtful responses.
          </p>
        </div>
        <Link
          to="/"
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-neutral-900 dark:text-white mb-1.5">
            Question Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            minLength={5}
            maxLength={250}
            placeholder="e.g., What are the physiological differences between aerobic and anaerobic threshold training?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Be specific and imagine you are asking a question to an expert in the field.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-neutral-900 dark:text-white mb-1.5">
            Knowledge Category <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCategorySlug}
            onChange={(e) => setSelectedCategorySlug(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Body Details */}
        <div>
          <label className="block text-xs font-semibold text-neutral-900 dark:text-white mb-1.5">
            Detailed Context & Background <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            minLength={10}
            maxLength={10000}
            rows={6}
            placeholder="Include relevant background, context, what you have already explored, or specific angles you are interested in..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-neutral-900 dark:text-white mb-1.5">
            Tags (Optional, up to 5)
          </label>
          <input
            type="text"
            placeholder="e.g. physiology, endurance, lactate (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
          />
        </div>

        {/* Anonymous Posting Option */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAnonymous ? (
                <EyeOff className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <Globe className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              )}
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                {isAnonymous ? 'Posting as Anonymous' : 'Posting Publicly'}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:after:w-4 after:w-4 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
            </label>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            {isAnonymous
              ? 'Your profile, username, avatar, and Firebase UID will be completely hidden from all other users. Platform ownership is kept in a restricted document strictly for moderation safety.'
              : `Your question will be linked to your public profile (@${userProfile?.username || 'member'}).`}
          </p>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Question'}
          </button>
        </div>

      </form>

    </div>
  );
};
