import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Shield,
  Palette,
  Bell,
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../core/context/AuthContext';
import { ConfirmModal } from '../components/dialogs/ConfirmModal';
import { ThemeToggle } from '../components/settings/ThemeToggle';

export const SettingsPage: React.FC = () => {
  const { currentUser, userProfile, userPrivate, updateProfileData, updatePrivateSettings, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  // Profile Form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(userProfile?.photoUrl || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Privacy & Notifications state
  const [defaultAnonymous, setDefaultAnonymous] = useState(userPrivate?.defaultAnonymous || false);
  const [emailNotifications, setEmailNotifications] = useState(userPrivate?.emailNotifications ?? true);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-3">
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white">Settings</h2>
        <p className="text-xs text-neutral-500">Sign in to manage your account and preferences.</p>
        <Link to="/login" className="inline-block px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoUrl: photoUrl.trim()
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacySaving(true);
    setPrivacySuccess(false);
    try {
      await updatePrivateSettings({
        defaultAnonymous,
        emailNotifications
      });
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleExecuteDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
          Account Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your public profile, privacy controls, and application preferences.
        </p>
      </div>

      {/* Public Profile Form */}
      <section className="bg-white dark:bg-neutral-900 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950 dark:text-white">
          <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Public Profile</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Username (Permanent Identifier)
            </label>
            <input
              type="text"
              disabled
              value={`@${userProfile?.username}`}
              className="w-full px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 cursor-not-allowed font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Biography & Areas of Interest
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Tell other thinkers about your background, reading interests, or technical expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-900 dark:text-white leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSuccess && (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-xl disabled:opacity-50 transition-colors shadow-xs"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Privacy & Notification Settings */}
      <section className="bg-white dark:bg-neutral-900 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950 dark:text-white">
          <Shield className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Privacy & Confidentiality</span>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Default to Anonymous Inquiries</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Automatically check "Post anonymously" when opening question and answer forms.
              </p>
            </div>
            <input
              type="checkbox"
              checked={defaultAnonymous}
              onChange={(e) => setDefaultAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">In-App Notification Alerts</p>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Receive notifications when members answer your questions or upvote your answers.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {privacySuccess && (
              <span className="text-emerald-600 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Preferences updated
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={privacySaving}
                className="px-5 py-2 font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-xl disabled:opacity-50 transition-colors shadow-xs"
              >
                {privacySaving ? 'Saving...' : 'Update Preferences'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-neutral-900 p-6 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-950 dark:text-white">
          <Palette className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span>Appearance & Color Theme</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Select your visual interface appearance. System mode automatically mirrors your operating system light/dark preference.
        </p>

        <ThemeToggle
          variant="cards"
          onThemeChange={async (newTheme) => {
            try {
              await updatePrivateSettings({ themePreference: newTheme });
            } catch (err) {
              console.warn('Could not sync theme preference to private user settings:', err);
            }
          }}
        />
      </section>

      {/* Danger Zone */}
      <section className="p-6 rounded-2xl border border-red-200 dark:border-red-950/50 bg-red-50/50 dark:bg-red-950/20 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Deleting your account is permanent. All your private credentials and bookmark records will be purged.
        </p>
        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
        >
          Delete Account
        </button>
      </section>

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleExecuteDeleteAccount}
        loading={deleteLoading}
        title="Delete OpenAsk Account"
        message="Are you sure you want to delete your account? This action is permanent. All your private credentials, notification settings, and bookmark records will be purged."
        confirmLabel="Yes, Delete My Account"
        confirmVariant="danger"
      />

    </div>
  );
};
