import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  EyeOff,
  Users,
  Award,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { ASSETS } from '../core/constants/assets';
import { categoryService } from '../core/services/categoryService';
import { Category } from '../core/models/types';
import { useAuth } from '../core/context/AuthContext';

export const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getAllCategories()
      .then((cats) => {
        setCategories(cats.slice(0, 8));
      })
      .catch((err) => {
        console.warn('Unable to load categories for landing page:', err);
      });
  }, []);

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white border border-neutral-800">
        <div className="absolute inset-0 z-0">
          <img
            src={ASSETS.heroKnowledge}
            alt="OpenAsk Community Forum"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl px-6 py-16 sm:px-12 sm:py-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-neutral-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Global Knowledge Exchange
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-display">
            Inquire with depth. Answer with rigor.
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            OpenAsk is an intentional web platform for global inquiry. Ask questions with genuine curiosity, contribute verified answers, follow emerging disciplines, and maintain complete privacy whenever you choose.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-xl transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ask a Question</span>
            </Link>

            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl backdrop-blur-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Categories</span>
            </Link>

            {!currentUser && (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                <span>Create an Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Mechanism: The Core Pillars of OpenAsk */}
      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Product Architecture
          </p>
          <h2 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
            Built for constructive dialogue
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
              Mathematical Privacy
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Ask and answer without hesitation. When posting anonymously, your user identifier is isolated in secure private ownership records and never exposed in public documents.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
              Earned Reputation
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No vanity metrics or artificial scoreboards. Reputation on OpenAsk is built strictly through community-voted helpful answers and substantive contributions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
              Community Moderation
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Built-in reporting, user blocking, and muting tools empower the community to preserve civil and focused knowledge discussions without toxicity.
            </p>
          </div>
        </div>
      </section>

      {/* Topics Overview with Real Categories */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Curated Domains
            </p>
            <h2 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
              50 structured knowledge categories
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-neutral-900 dark:text-white hover:underline inline-flex items-center gap-1"
          >
            View all 50 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/category/${c.slug}`}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1 truncate">
                {c.name}
              </h3>
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Visual Showcase: Tech & Culture */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white min-h-[260px] flex flex-col justify-end p-6">
          <img
            src={ASSETS.categoryTechAi}
            alt="Technology Inquiries"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
              Emerging Systems
            </span>
            <h3 className="text-xl font-bold font-display">Technology & Artificial Intelligence</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Explore algorithms, distributed infrastructure, hardware architectures, and AI frontiers.
            </p>
            <Link
              to="/category/technology"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white pt-2 hover:underline"
            >
              Explore Discussions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white min-h-[260px] flex flex-col justify-end p-6">
          <img
            src={ASSETS.categoryCultureBooks}
            alt="Philosophy and Culture"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
              Humanities & Society
            </span>
            <h3 className="text-xl font-bold font-display">Philosophy, History & Culture</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Debate ethics, historical inflection points, literature, and cross-cultural phenomena.
            </p>
            <Link
              to="/category/philosophy"
              className="inline-flex items-center gap-1 text-xs font-semibold text-white pt-2 hover:underline"
            >
              Explore Discussions <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="p-8 sm:p-12 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white font-display">
          Join a global network of inquisitive minds
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          OpenAsk is free to use, completely ad-free, and designed with zero artificial vanity hype. Ask your questions or share your expertise today.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/signup"
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl transition-colors shadow-xs"
          >
            Create Free Account
          </Link>
          <Link
            to="/discover"
            className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-colors"
          >
            Browse Discussions
          </Link>
        </div>
      </section>

    </div>
  );
};
