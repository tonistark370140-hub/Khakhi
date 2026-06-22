'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase, News, Notification, UserStats } from '@/lib/supabase';
import {
  Home as HomeIcon, BookOpen, Newspaper, User, Bell, Sun, Moon, Menu, X,
  Trophy, Target, Flame, Star, ChevronRight, Clock, CheckCircle,
  XCircle, LogOut, Settings, Award, TrendingUp, Calendar,
  Lock, Gift, AlertCircle, Info, Check, Play
} from 'lucide-react';

// Types
type Screen = 'home' | 'quiz' | 'news' | 'profile' | 'notifications' | 'login';
type QuizScreen = 'select' | 'playing' | 'result';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Questions database
const questionsDB: Question[] = [
  // LRD Questions
  { id: 1, category: 'lrd', question: 'What is the minimum height requirement for male LRD candidates?', options: ['160 cm', '165 cm', '168 cm', '170 cm'], correctAnswer: 1, explanation: 'Male candidates require minimum 165 cm height for LRD.', difficulty: 'easy' },
  { id: 2, category: 'lrd', question: 'What is the running distance in LRD physical test?', options: ['800 meters', '1000 meters', '1600 meters', '5000 meters'], correctAnswer: 2, explanation: '1600 meters running test is conducted for LRD recruitment.', difficulty: 'easy' },
  { id: 3, category: 'lrd', question: 'What is the age limit for LRD constable post?', options: ['18-25 years', '18-28 years', '21-30 years', '18-33 years'], correctAnswer: 3, explanation: 'Age limit for LRD constable is 18-33 years with relaxations.', difficulty: 'medium' },
  // PSI Questions
  { id: 4, category: 'psi', question: 'PSI exam is conducted by which commission?', options: ['UPSC', 'GPSC', 'SSC', 'State PSC'], correctAnswer: 1, explanation: 'Gujarat Public Service Commission (GPSC) conducts PSI exam.', difficulty: 'easy' },
  { id: 5, category: 'psi', question: 'What is the educational qualification required for PSI?', options: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate'], correctAnswer: 2, explanation: 'Graduation is the minimum educational qualification for PSI.', difficulty: 'easy' },
  { id: 6, category: 'psi', question: 'PSI stands for?', options: ['Police Sub Inspector', 'Public Service Inspector', 'Provincial State Inspector', 'Police State Inspector'], correctAnswer: 0, explanation: 'PSI stands for Police Sub Inspector.', difficulty: 'easy' },
  // General Knowledge
  { id: 7, category: 'gk', question: 'Which is the largest district in Gujarat by area?', options: ['Ahmedabad', 'Kutch', 'Banaskantha', 'Patan'], correctAnswer: 1, explanation: 'Kutch is the largest district in Gujarat covering about 45,000 sq km.', difficulty: 'medium' },
  { id: 8, category: 'gk', question: 'Who was the first Deputy Prime Minister of India?', options: ['Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Morarji Desai', 'Lal Bahadur Shastri'], correctAnswer: 1, explanation: 'Sardar Vallabhbhai Patel was India\'s first Deputy Prime Minister.', difficulty: 'medium' },
  { id: 9, category: 'gk', question: 'Gir National Park is famous for?', options: ['Tigers', 'Lions', 'Elephants', 'Rhinos'], correctAnswer: 1, explanation: 'Gir is the only home of Asiatic Lions in the wild.', difficulty: 'easy' },
  // Mathematics
  { id: 10, category: 'math', question: 'If a car travels 60 km in 1 hour, how much distance will it cover in 2.5 hours?', options: ['120 km', '140 km', '150 km', '180 km'], correctAnswer: 2, explanation: 'Distance = Speed × Time = 60 × 2.5 = 150 km', difficulty: 'easy' },
  { id: 11, category: 'math', question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correctAnswer: 1, explanation: '15% of 200 = (15/100) × 200 = 30', difficulty: 'easy' },
  { id: 12, category: 'math', question: 'If A:B = 3:4 and B:C = 5:6, what is A:C?', options: ['3:6', '5:8', '15:24', '4:5'], correctAnswer: 2, explanation: 'A:C = (3×5):(4×6) = 15:24 = 5:8', difficulty: 'medium' },
];

const categories = [
  { id: 'lrd', name: 'LRD Exam', icon: '👮', color: '#e94560', count: 3 },
  { id: 'psi', name: 'PSI Exam', icon: '🎖️', color: '#6366f1', count: 3 },
  { id: 'gk', name: 'General Knowledge', icon: '📚', color: '#10b981', count: 3 },
  { id: 'math', name: 'Mathematics', icon: '📐', color: '#f59e0b', count: 3 },
];

// Login Screen Component
function LoginScreen() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signInWithEmail(email, password);
        if (result.error) setError(result.error);
      } else {
        const result = await signUpWithEmail(email, password, name);
        if (result.error) setError(result.error);
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">👮</div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Khakhi</span> Challenge
          </h1>
          <p className="text-[var(--text-secondary)]">Prepare for LRD, PSI & more</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {/* Google Sign In */}
          <button
            onClick={signInWithGoogle}
            className="w-full btn btn-secondary mb-4 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.48 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-sm text-[var(--text-secondary)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                required={!isLogin}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              required
            />

            {error && (
              <div className="badge badge-error flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-[var(--text-secondary)]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[var(--primary)] font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Theme Toggle Component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${theme === 'light' ? 'active' : ''}`}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-thumb">
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-white" />
        )}
      </div>
    </button>
  );
}

// Ad Placeholder Component
function AdPlaceholder({ size = 'banner' }: { size?: 'banner' | 'square' }) {
  return (
    <div
      className={`ad-placeholder ${size === 'banner' ? 'h-[90px] w-full' : 'h-[250px] w-full max-w-[300px]'}`}
    >
      <Gift className="w-8 h-8 mb-2 opacity-50" />
      <span>Advertisement</span>
      <span className="text-xs opacity-50">Your ad here</span>
    </div>
  );
}

// Premium Button Component
function PremiumButton() {
  return (
    <button className="w-full btn relative overflow-hidden group" style={{
      background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    }}>
      <Lock className="w-4 h-4 absolute left-4 opacity-50" />
      <span className="flex items-center gap-2">
        <span className="premium-badge">PREMIUM</span>
        <span className="text-black font-bold">Unlock All Quizzes</span>
      </span>
      <ChevronRight className="w-4 h-4 absolute right-4 opacity-70 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

// Navigation Component
function Navigation({
  screen,
  setScreen,
  unreadCount
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
  unreadCount: number;
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home' as Screen, icon: HomeIcon, label: 'Home' },
    { id: 'quiz' as Screen, icon: BookOpen, label: 'Quiz' },
    { id: 'news' as Screen, icon: Newspaper, label: 'News' },
    { id: 'notifications' as Screen, icon: Bell, label: 'Alerts', badge: unreadCount },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="sidebar hidden md:flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Khakhi</span>
          </h1>
        </div>

        <div className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                screen === item.id
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-r-2 border-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => setScreen('profile')}
            className="w-full btn btn-secondary text-sm"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden flex justify-around">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 relative ${
              screen === item.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => setScreen('profile')}
          className={`flex flex-col items-center gap-1 px-3 py-1 ${
            screen === 'profile' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </button>
      </nav>
    </>
  );
}

// Home Screen Component
function HomeScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { user, profile, stats } = useAuth();
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3);
      if (data) setNews(data);
    }
    fetchNews();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-[var(--text-secondary)]">Ready for today's challenge?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="card">
            <Trophy className="w-8 h-8 text-[var(--primary)] mb-2" />
            <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
            <div className="text-sm text-[var(--text-secondary)]">Points</div>
          </div>
          <div className="card">
            <Target className="w-8 h-8 text-[var(--success)] mb-2" />
            <div className="text-2xl font-bold">{stats?.total_correct || 0}</div>
            <div className="text-sm text-[var(--text-secondary)]">Correct</div>
          </div>
          <div className="card">
            <Flame className="w-8 h-8 text-[var(--warning)] mb-2" />
            <div className="text-2xl font-bold">{stats?.current_streak || 0}</div>
            <div className="text-sm text-[var(--text-secondary)]">Streak</div>
          </div>
          <div className="card">
            <TrendingUp className="w-8 h-8 text-[var(--accent)] mb-2" />
            <div className="text-2xl font-bold">#{stats?.rank || '--'}</div>
            <div className="text-sm text-[var(--text-secondary)]">Rank</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold mb-4">Quick Start</h2>
          <button
            onClick={() => setScreen('quiz')}
            className="w-full btn btn-primary text-lg"
          >
            <Play className="w-5 h-5" />
            Start Quiz
          </button>
        </div>

        {/* Premium Banner */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <PremiumButton />
        </div>

        {/* Ad Banner */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <AdPlaceholder size="banner" />
        </div>

        {/* Latest News */}
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Latest Updates</h2>
            <button
              onClick={() => setScreen('news')}
              className="text-[var(--primary)] text-sm flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {news.map(item => (
              <div key={item.id} className="card card-interactive">
                {item.is_important && (
                  <span className="badge badge-error mb-2">Important</span>
                )}
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quiz Screen Component
function QuizScreenMain() {
  const { user, refreshStats } = useAuth();
  const [screen, setScreen] = useState<QuizScreen>('select');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState({ correct: 0, points: 0 });
  const [streak, setStreak] = useState(0);
  const TOTAL_TIME = 30;

  const currentQuestion = questions[currentIndex];

  // Timer effect
  useEffect(() => {
    if (isAnswered || !currentQuestion || screen !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswered, screen]);

  const startQuiz = (categoryId: string) => {
    const qs = categoryId === 'all'
      ? [...questionsDB].sort(() => Math.random() - 0.5)
      : questionsDB.filter(q => q.category === categoryId);
    setQuestions(qs);
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setScore({ correct: 0, points: 0 });
    setStreak(0);
    setScreen('playing');
    setIsAnswered(false);
    setTimeLeft(TOTAL_TIME);
  };

  const handleAnswer = useCallback((answerIndex: number) => {
    if (isAnswered || !currentQuestion) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? 10 + Math.floor(timeLeft / 3) : 0;

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      points: prev.points + pointsEarned,
    }));
    setStreak(prev => isCorrect ? prev + 1 : 0);
  }, [currentQuestion, timeLeft, isAnswered]);

  const nextQuestion = async () => {
    if (currentIndex >= questions.length - 1) {
      // Save to database
      if (user) {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          category: selectedCategory,
          total_questions: questions.length,
          correct_answers: score.correct,
          points_earned: score.points,
          time_spent: TOTAL_TIME * questions.length - timeLeft,
        });
        refreshStats();
      }
      setScreen('result');
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setIsAnswered(false);
    setTimeLeft(TOTAL_TIME);
  };

  // Category Select Screen
  if (screen === 'select') {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 animate-fade-in">Choose Category</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {categories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => startQuiz(cat.id)}
                className="card text-left animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${cat.color}20` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{cat.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {cat.count} questions
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => startQuiz('all')}
            className="w-full btn btn-primary text-lg animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Play className="w-5 h-5" />
            Quick Play - All Categories
          </button>

          <div className="mt-6">
            <PremiumButton />
          </div>
        </div>
      </div>
    );
  }

  // Quiz Playing Screen
  if (screen === 'playing' && currentQuestion) {
    const progress = ((currentIndex) / questions.length) * 100;
    const circumference = 2 * Math.PI * 45;

    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-2">
              <span>Question {currentIndex + 1}/{questions.length}</span>
              <span>{categories.find(c => c.id === currentQuestion.category)?.name}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill progress-bar-gradient" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question Card */}
          <div className="card animate-fade-in">
            {/* Header with Timer and Difficulty */}
            <div className="flex justify-between items-start mb-6">
              <span
                className={`badge ${
                  currentQuestion.difficulty === 'easy' ? 'badge-success' :
                  currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="45"
                    stroke="var(--bg-tertiary)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    stroke={timeLeft <= 5 ? 'var(--error)' : 'var(--primary)'}
                    strokeWidth="6"
                    fill="none"
                    className="timer-ring"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: circumference - (timeLeft / TOTAL_TIME) * circumference,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-[var(--error)]' : ''}`}>
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isAnswered && handleAnswer(index)}
                  className={`option-btn ${
                    showExplanation
                      ? index === currentQuestion.correctAnswer
                        ? 'correct'
                        : selectedAnswer === index
                        ? 'incorrect'
                        : ''
                      : selectedAnswer === index
                      ? 'selected'
                      : ''
                  }`}
                  disabled={isAnswered}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                  {showExplanation && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-[var(--success)] ml-auto" />
                  )}
                  {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                    <XCircle className="w-5 h-5 text-[var(--error)] ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-6 p-4 rounded-xl bg-[var(--bg-tertiary)] animate-fade-in">
                <p className="text-sm text-[var(--text-secondary)]">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button onClick={nextQuestion} className="w-full btn btn-primary mt-6">
                {currentIndex >= questions.length - 1 ? 'See Results' : 'Next Question'}
              </button>
            )}
          </div>

          {/* Streak indicator */}
          {streak > 0 && (
            <div className="mt-4 text-center animate-fade-in">
              <span className="badge badge-warning flex items-center gap-1 mx-auto">
                <Flame className="w-4 h-4" />
                {streak} Streak!
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Result Screen
  if (screen === 'result') {
    const percentage = Math.round((score.correct / questions.length) * 100);
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
    const gradeColor = percentage >= 80 ? 'var(--success)' : percentage >= 60 ? 'var(--warning)' : 'var(--error)';

    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-md w-full text-center animate-fade-in">
          {/* Grade Display */}
          <div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-bold mb-6 animate-float"
            style={{ background: `${gradeColor}20`, border: `4px solid ${gradeColor}`, color: gradeColor }}
          >
            {grade}
          </div>

          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-[var(--text-secondary)] mb-8">
            You scored {score.correct} out of {questions.length}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-bold">{percentage}%</div>
              <div className="text-sm text-[var(--text-secondary)]">Accuracy</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold gradient-text">{score.points}</div>
              <div className="text-sm text-[var(--text-secondary)]">Points</div>
            </div>
          </div>

          {/* Ad */}
          <div className="mb-6">
            <AdPlaceholder size="square" />
          </div>

          {/* Premium */}
          <div className="mb-6">
            <PremiumButton />
          </div>

          {/* Actions */}
          <button onClick={() => setScreen('select')} className="w-full btn btn-primary">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// News Screen Component
function NewsScreen() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      const { data } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });
      if (data) setNews(data);
      setLoading(false);
    }
    fetchNews();
  }, []);

  const filteredNews = filter === 'all'
    ? news
    : news.filter(n => n.category === filter);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 animate-fade-in">
          Recruitment News <span className="text-2xl">સમાચાર</span>
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up">
          {['all', 'lrd', 'psi', 'general'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}
            >
              {cat === 'all' ? 'All' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              Loading...
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              No news found
            </div>
          ) : (
            filteredNews.map((item, index) => (
              <article
                key={item.id}
                className="card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: item.category === 'lrd' ? '#e9456020' : item.category === 'psi' ? '#6366f120' : '#10b98120' }}
                  >
                    {item.category === 'lrd' ? '👮' : item.category === 'psi' ? '🎖️' : '📰'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.is_important && (
                        <span className="badge badge-error flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Important
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-secondary)]">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="font-bold mb-2">{item.title}</h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.content}
                    </p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Ad */}
        <div className="mt-6">
          <AdPlaceholder size="banner" />
        </div>
      </div>
    </div>
  );
}

// Profile Screen Component
function ProfileScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const { user, profile, stats, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [targetExam, setTargetExam] = useState(profile?.target_exam || 'LRD');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setTargetExam(profile.target_exam || 'LRD');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: name, phone, city, target_exam: targetExam });
    setEditing(false);
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{profile?.full_name || 'Student'}</h1>
          <p className="text-[var(--text-secondary)]">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <div className="card text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-[var(--primary)]" />
            <div className="text-xl font-bold">{stats?.total_points || 0}</div>
            <div className="text-xs text-[var(--text-secondary)]">Points</div>
          </div>
          <div className="card text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-[var(--accent)]" />
            <div className="text-xl font-bold">{stats?.total_quizzes || 0}</div>
            <div className="text-xs text-[var(--text-secondary)]">Quizzes</div>
          </div>
          <div className="card text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-[var(--success)]" />
            <div className="text-xl font-bold">{stats?.total_correct || 0}</div>
            <div className="text-xs text-[var(--text-secondary)]">Correct</div>
          </div>
          <div className="card text-center">
            <Flame className="w-6 h-6 mx-auto mb-2 text-[var(--warning)]" />
            <div className="text-xl font-bold">{stats?.best_streak || 0}</div>
            <div className="text-xs text-[var(--text-secondary)]">Best Streak</div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Profile Settings</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary text-sm py-2">
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                disabled={!editing}
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input"
                disabled={!editing}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="input"
                disabled={!editing}
                placeholder="Ahmedabad"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Target Exam</label>
              <select
                value={targetExam}
                onChange={e => setTargetExam(e.target.value)}
                className="input"
                disabled={!editing}
              >
                <option value="LRD">LRD - Lokrakshak Dal</option>
                <option value="PSI">PSI - Police Sub Inspector</option>
                <option value="Constable">Constable</option>
              </select>
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditing(false)} className="flex-1 btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn btn-primary">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="card mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>Dark Mode</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button onClick={signOut} className="w-full btn btn-secondary mt-4 text-[var(--error)]">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Notifications Screen Component
function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setNotifications(data);
      setLoading(false);
    }
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="w-5 h-5 text-[var(--success)]" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-[var(--warning)]" />;
      case 'error': return <XCircle className="w-5 h-5 text-[var(--error)]" />;
      default: return <Info className="w-5 h-5 text-[var(--accent)]" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      case 'warning': return 'rgba(245, 158, 11, 0.1)';
      case 'error': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(99, 102, 241, 0.1)';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold animate-fade-in">Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[var(--primary)] animate-fade-in"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Sample notifications if empty */}
        {loading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="space-y-4 animate-slide-up">
            {/* Sample notifications */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                >
                  <Info className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Welcome to Khakhi Challenge!</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Start your exam preparation journey today. Take quizzes and track your progress.
                  </p>
                  <div className="text-xs text-[var(--text-secondary)] mt-2">Just now</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                >
                  <Trophy className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Daily Challenge Available</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Complete today's challenge to maintain your streak!
                  </p>
                  <div className="text-xs text-[var(--text-secondary)] mt-2">2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <div
                key={notif.id}
                className={`card ${!notif.is_read ? 'border-l-2 border-l-[var(--primary)]' : ''}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: getBgColor(notif.type) }}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{notif.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {notif.message}
                    </p>
                    <div className="text-xs text-[var(--text-secondary)] mt-2">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function Home() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          setUnreadNotifications(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin-slow mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex">
      <Navigation
        screen={screen}
        setScreen={setScreen}
        unreadCount={unreadNotifications}
      />

      <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold">
            <span className="gradient-text">Khakhi</span>
          </h1>
          <ThemeToggle />
        </header>

        {/* Screen Content */}
        {screen === 'home' && <HomeScreen setScreen={setScreen} />}
        {screen === 'quiz' && <QuizScreenMain />}
        {screen === 'news' && <NewsScreen />}
        {screen === 'profile' && <ProfileScreen setScreen={setScreen} />}
        {screen === 'notifications' && (
          <NotificationsScreen />
        )}
      </main>
    </div>
  );
}
