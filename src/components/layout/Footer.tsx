import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-10 mt-16 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div>
            <p className="font-semibold text-neutral-950 dark:text-white uppercase tracking-wider mb-3">
              Platform
            </p>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><Link to="/" className="hover:text-neutral-950 dark:hover:text-white">Feed</Link></li>
              <li><Link to="/discover" className="hover:text-neutral-950 dark:hover:text-white">Discover</Link></li>
              <li><Link to="/categories" className="hover:text-neutral-950 dark:hover:text-white">Topics</Link></li>
              <li><Link to="/ask" className="hover:text-neutral-950 dark:hover:text-white">Ask Question</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-950 dark:text-white uppercase tracking-wider mb-3">
              Community
            </p>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><Link to="/guidelines" className="hover:text-neutral-950 dark:hover:text-white">Community Guidelines</Link></li>
              <li><Link to="/guidelines#anonymous" className="hover:text-neutral-950 dark:hover:text-white">Anonymous Inquiries</Link></li>
              <li><Link to="/guidelines#reputation" className="hover:text-neutral-950 dark:hover:text-white">Reputation Model</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-950 dark:text-white uppercase tracking-wider mb-3">
              Trust & Safety
            </p>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><Link to="/terms" className="hover:text-neutral-950 dark:hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-neutral-950 dark:hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/guidelines#reporting" className="hover:text-neutral-950 dark:hover:text-white">Report Abuse</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-neutral-950 dark:text-white uppercase tracking-wider mb-3">
              OpenAsk
            </p>
            <p className="text-neutral-500 leading-relaxed">
              A global, human-centered knowledge and discussion forum built for thoughtful questions and genuine answers.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 gap-3">
          <p>© {new Date().getFullYear()} OpenAsk. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link to="/guidelines" className="hover:underline">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
