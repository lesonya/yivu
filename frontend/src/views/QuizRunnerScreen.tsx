import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useUserStore } from '../store/useUserStore';
import { db } from '../core/database/offlineDb';
import type { Question } from '../core/types/curriculum';
import { MathRenderer } from '../components/common/MathRenderer';
import { useDpadNavigation } from '../core/hooks/useDpadNavigation';
import { soundManager } from '../core/services/soundEffects';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Star,
  Award,
  Image as ImageIcon,
  Clock,
  Volume2,
  VolumeX,
  Volume1,
  FileCheck,
  X,
  Bot,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export const QuizRunnerScreen: React.FC = () => {
  const { materialId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getPaperById } = useCurriculumStore();
  const { activeProfile, addXP, addStars } = useUserStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedStars, setEarnedStars] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  // Sound effects mute state
  const [isMuted, setIsMuted] = useState(false);

  // Timed Examination Mode: 45 Minutes Standard Countdown (2700s)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(2700);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStartedQuiz, setHasStartedQuiz] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Enable Smart TV / Keyboard D-pad navigation across option buttons
  useDpadNavigation({
    itemSelector: '[data-dpad-quiz-item]',
    enabled: !isLoading && !isFinished
  });

  const [materialMeta, setMaterialMeta] = useState<any>(location.state?.material || null);

  const materialTitle = materialMeta?.title || location.state?.material?.title || 'Examination Practice';
  const subjectName = location.state?.subjectName || 'Curriculum Subject';
  const subjectId = materialMeta?.subject_id || location.state?.material?.subject_id || 'std_math';

  useEffect(() => {
    async function loadQuestions() {
      if (!materialId) return;
      setIsLoading(true);
      const paper = await getPaperById(materialId);
      if (paper) {
        setMaterialMeta(paper);
        if (paper.questions && paper.questions.length > 0) {
          setQuestions(paper.questions);
        }
      }
      setIsLoading(false);
    }
    loadQuestions();
  }, [materialId]);

  // Countdown Timer Interval
  useEffect(() => {
    if (!isTimerRunning || isFinished || isLoading) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, isFinished, isLoading]);

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswerIndex(index);
    setIsSubmitted(true);
    setAiExplanation(null);
    setIsAiPanelOpen(false);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: index }));

    const isCorrect = index === currentQ.correct_index;
    if (isCorrect) {
      soundManager.playCorrect();
      setCorrectAnswersCount((prev) => prev + 1);
      setEarnedXP((prev) => prev + 10);
      setEarnedStars((prev) => prev + 1);
      addXP(10);
      addStars(1);
    } else {
      soundManager.playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    soundManager.stopSpeaking();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsSubmitted(false);
      setAiExplanation(null);
      setIsAiPanelOpen(false);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    soundManager.stopSpeaking();
    soundManager.playFanfare();
    setIsTimerRunning(false);
    setIsFinished(true);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const score = correctAnswersCount + (selectedAnswerIndex === currentQ?.correct_index ? 1 : 0);
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Determine Botswana Attainment Grade Band
    let gradeBand: 'A' | 'B' | 'C' | 'D' | 'E' = 'E';
    if (percentage >= 80) gradeBand = 'A';
    else if (percentage >= 70) gradeBand = 'B';
    else if (percentage >= 60) gradeBand = 'C';
    else if (percentage >= 50) gradeBand = 'D';

    // Persist attempt into IndexedDB
    try {
      await db.attempts.put({
        id: `att_${Date.now()}`,
        learnerId: activeProfile.id,
        learnerName: activeProfile.displayName,
        materialId: materialId || 'exam',
        materialTitle: materialTitle,
        subjectId: subjectId,
        gradeKey: activeProfile.gradeKey,
        score,
        totalQuestions: total,
        percentage,
        gradeBand,
        timeSpentSeconds: timeSpent,
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Could not record attempt to IndexedDB:', e);
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    const optionsText = (currentQ.options || [])
      .map((opt, i) => `Option ${optionLetters[i]}: ${opt}`)
      .join('. ');
    soundManager.speakText(`${currentQ.prompt}. ${optionsText}`);
  };

  const handleExplainWithAI = async () => {
    setIsAiPanelOpen(true);
    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const res = await fetch('http://localhost:5050/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade_key: activeProfile.gradeKey,
          subject_name: subjectName,
          prompt: currentQ.prompt,
          options: currentQ.options,
          correct_index: currentQ.correct_index,
          selected_index: selectedAnswerIndex ?? -1,
          syllabus_explanation: currentQ.explanation
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
        setAiSource(data.source);
      } else {
        throw new Error('Server returned ' + res.status);
      }
    } catch {
      setAiExplanation(
        `Curriculum Rule: ${currentQ.explanation || 'Ensure your calculations and unit steps follow the standard Botswana syllabus requirements.'}`
      );
      setAiSource('offline-cache');
    } finally {
      setIsAiLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 max-w-xl mx-auto">
        <div className="animate-spin w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-white">Preparing Examination Questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-surface-navy border border-border-navy rounded-2xl p-12 text-center max-w-md mx-auto mt-12">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-white">No Questions Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          This paper does not contain structured CBT questions or is still processing.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold"
        >
          Return to Materials
        </button>
      </div>
    );
  }

  // Finished Results Screen with Attainment Grade & Interactive Review
  if (isFinished) {
    const finalScore = correctAnswersCount;
    const finalPercent = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0;
    let attainmentBand = 'Grade D';
    if (finalPercent >= 80) attainmentBand = 'Grade A (Distinction)';
    else if (finalPercent >= 70) attainmentBand = 'Grade B (Credit)';
    else if (finalPercent >= 60) attainmentBand = 'Grade C (Pass)';

    const incorrectIndices = questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q, idx }) => userAnswers[idx] !== undefined && userAnswers[idx] !== q.correct_index)
      .map(({ idx }) => idx);

    if (isReviewMode) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 pb-16">
          <div className="bg-surface-navy border border-border-navy p-6 rounded-3xl flex items-center justify-between shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white">Question by Question Review</h2>
              <p className="text-xs text-slate-400">Review your choices vs. official syllabus answers</p>
            </div>
            <button
              onClick={() => setIsReviewMode(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-white"
            >
              Back to Summary
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userChoice = userAnswers[idx];
              const isRight = userChoice === q.correct_index;
              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isRight ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Question {q.question_number || idx + 1}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isRight ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isRight ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200">
                    <MathRenderer text={q.prompt} />
                  </div>

                  <div className="text-xs space-y-1 pt-1 border-t border-border-navy/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Your Answer:</span>
                      <span className={`font-bold ${isRight ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {userChoice !== undefined ? (
                          <MathRenderer text={q.options[userChoice]} />
                        ) : (
                          'Unanswered'
                        )}
                      </span>
                    </div>
                    {!isRight && (
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Official Correct Answer:</span>
                        <span className="font-bold text-emerald-400">
                          <MathRenderer text={q.options[q.correct_index]} />
                        </span>
                      </div>
                    )}
                    {q.explanation && (
                      <p className="text-[11px] text-slate-400 pt-1 italic">{q.explanation}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto mt-6 bg-surface-navy border border-border-navy rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-gold-star/20 border-2 border-gold-star text-gold-star flex items-center justify-center mx-auto text-4xl shadow-lg">
          🏆
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-cyan bg-brand-cyan/20 px-3 py-1 rounded-full border border-brand-cyan/30">
            Official Exam Result
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-2">Examination Completed!</h2>
          <p className="text-xs text-slate-400 mt-0.5">Learner: <span className="text-white font-bold">{activeProfile.displayName}</span></p>
        </div>

        {/* Attainment Grade Banner */}
        <div className="bg-dark-navy p-4 rounded-2xl border border-border-navy">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Attainment Classification</div>
          <div className="text-xl font-extrabold text-white mt-1">{attainmentBand}</div>
          <div className="text-sm font-extrabold text-brand-cyan mt-0.5">{finalScore} / {questions.length} Correct ({finalPercent}%)</div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="bg-dark-navy p-3.5 rounded-2xl border border-border-navy">
            <div className="text-xl font-extrabold text-gold-star flex items-center justify-center space-x-1">
              <Star className="w-5 h-5 fill-current" />
              <span>+{earnedStars}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">Stars Earned</div>
          </div>
          <div className="bg-dark-navy p-3.5 rounded-2xl border border-border-navy">
            <div className="text-xl font-extrabold text-brand-cyan flex items-center justify-center space-x-1">
              <Award className="w-5 h-5" />
              <span>+{earnedXP}</span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold mt-1">XP Gained</div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Review Answers Button */}
          <button
            onClick={() => setIsReviewMode(true)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
          >
            <span>Review All Answers & Explanations</span>
          </button>

          {/* Retry Missed Questions */}
          {incorrectIndices.length > 0 && (
            <button
              onClick={() => {
                const retryQuestions = questions.filter((_, idx) => incorrectIndices.includes(idx));
                setQuestions(retryQuestions);
                setCurrentIndex(0);
                setSelectedAnswerIndex(null);
                setIsSubmitted(false);
                setIsFinished(false);
                setAiExplanation(null);
                setUserAnswers({});
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl shadow transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry {incorrectIndices.length} Incorrect Questions</span>
            </button>
          )}

          <button
            onClick={() => navigate('/analytics')}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-dark-navy hover:bg-slate-800 text-slate-300 border border-border-navy font-semibold text-xs rounded-xl shadow transition active:scale-95"
          >
            <FileCheck className="w-4 h-4" />
            <span>View Full Diagnostic Report</span>
          </button>
        </div>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // 1. Initial Briefing / Cover Slide (Header Information Screen)
  if (!hasStartedQuiz) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        <div className="cognix-card p-8 sm:p-10 text-center space-y-6 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative ambient glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-blue/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />

          {/* Badge chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-cyan bg-brand-cyan/15 px-3 py-1 rounded-full border border-brand-cyan/30">
              {activeProfile.gradeKey.toUpperCase().replace('_', ' ')}
            </span>
            <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10">
              {subjectName}
            </span>
            <span className="text-xs text-slate-300 font-semibold bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {materialMeta?.term || 'Term 1'} Assessment
            </span>
          </div>

          {/* Paper Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {materialTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
              Botswana National Curriculum examination assessment. Review the test parameters below before proceeding to Question 1.
            </p>
          </div>

          {/* Key Parameters Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/10 text-center">
              <div className="text-xl font-extrabold text-white flex items-center justify-center space-x-1.5">
                <FileCheck className="w-5 h-5 text-brand-cyan" />
                <span>{questions.length}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Total Questions</div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/10 text-center">
              <div className="text-xl font-extrabold text-amber-400 flex items-center justify-center space-x-1.5">
                <Clock className="w-5 h-5" />
                <span>45 Mins</span>
              </div>
              <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Allocated Time</div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/50 p-4 rounded-2xl border border-white/10 text-center">
              <div className="text-xl font-extrabold text-gold-star flex items-center justify-center space-x-1.5">
                <Star className="w-5 h-5 fill-current" />
                <span>+{questions.length * 10} XP</span>
              </div>
              <div className="text-[11px] text-slate-400 font-bold uppercase mt-1">Attainment Goal</div>
            </div>
          </div>

          {/* Rules / Examination Guidelines */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-brand-cyan" />
              <span>Examination Guidelines</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Read each question carefully before submitting your answer.</li>
              <li>You may use the <strong>AI Tutor</strong> for step-by-step curriculum explanations.</li>
              <li>Timer starts immediately when you tap <strong>Proceed to Question 1</strong>.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95 border border-white/10"
            >
              Back to Materials
            </button>
            <button
              data-dpad-quiz-item
              onClick={() => {
                setHasStartedQuiz(true);
                setIsTimerRunning(true);
                startTimeRef.current = Date.now();
                soundManager.playCorrect();
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-blue via-blue-600 to-brand-cyan hover:opacity-95 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.35)] transition transform active:scale-95"
            >
              <span>Proceed to Question 1</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto space-y-6 pb-12 transition-all duration-300 ${isAiPanelOpen ? 'max-w-7xl' : 'max-w-3xl'}`}>
      {/* Top Question Tracker & Countdown Header */}
      <div className="flex items-center justify-between bg-surface-navy border border-border-navy p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-brand-cyan bg-brand-cyan/20 px-2.5 py-1 rounded-md border border-brand-cyan/30">
            Q{currentQ.question_number || currentIndex + 1} of {questions.length}
          </span>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>
        </div>

        {/* Audio Mute & TTS Read Aloud */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSpeakQuestion}
            title="Read Question Aloud"
            className="p-1.5 rounded-lg bg-dark-navy border border-border-navy text-slate-300 hover:text-brand-cyan transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? 'Unmute Game Audio' : 'Mute Game Audio'}
            className="p-1.5 rounded-lg bg-dark-navy border border-border-navy text-slate-300 hover:text-white transition active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume1 className="w-4 h-4 text-emerald-400" />}
          </button>

          <div className="h-4 w-px bg-border-navy mx-1"></div>

          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="text-gold-star">⭐ {earnedStars}</span>
            <span className="text-brand-cyan">⚡ {earnedXP} XP</span>
          </div>
        </div>
      </div>

      {/* Main Runner Layout: Split View when AI Tutor is Open, Centered Single Column when Closed */}
      <div className={isAiPanelOpen ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'space-y-6'}>
        {/* Left Column: Question & Options */}
        <div className={isAiPanelOpen ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
          <div className="bg-surface-navy border border-border-navy rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {currentQ.question_type || 'Multiple Choice Question'}
                </span>
                {isAiPanelOpen && (
                  <span className="hidden sm:inline-flex items-center space-x-1.5 text-[11px] font-bold text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Tutor Mode Active</span>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                <MathRenderer text={currentQ.prompt} />
              </h2>

              {/* Visual Diagram Asset (if present) */}
              {currentQ.has_diagram && (
                <div className="mt-4 p-4 rounded-2xl bg-dark-navy border border-border-navy flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-navy text-brand-cyan flex items-center justify-center mb-2">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">
                    {currentQ.diagram_description || 'Visual examination diagram'}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Ref: {currentQ.diagram_filename || 'curriculum_figure.png'}
                  </span>
                </div>
              )}
            </div>

            {/* Options List for Multiple Choice OR Theory/Revision Direct Navigation */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  let optionStyles = 'bg-dark-navy/80 border-border-navy hover:bg-slate-800 text-slate-200 focus:border-brand-cyan focus:bg-slate-800';

                  if (isSubmitted) {
                    if (idx === currentQ.correct_index) {
                      optionStyles = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50';
                    } else if (idx === selectedAnswerIndex) {
                      optionStyles = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500/50';
                    } else {
                      optionStyles = 'opacity-40 border-border-navy text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      data-dpad-quiz-item
                      disabled={isSubmitted}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition duration-150 outline-none active:scale-[0.99] ${optionStyles}`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className="w-8 h-8 rounded-xl bg-surface-navy border border-border-navy flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {optionLetters[idx] || idx + 1}
                        </span>
                        <span className="text-sm font-semibold leading-relaxed">
                          <MathRenderer text={option} />
                        </span>
                      </div>

                      {isSubmitted && idx === currentQ.correct_index && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {isSubmitted && idx === selectedAnswerIndex && idx !== currentQ.correct_index && (
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Theory / Structured Question or Revision Note Card */
              <div className="p-4 rounded-2xl bg-dark-navy/60 border border-border-navy space-y-3">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span>Structured Question / Curriculum Concept Item</span>
                  <span className="text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Self-Paced Practice
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review the concept prompt above or use the AI Tutor to explore the official Botswana marking criteria.
                </p>
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={handleExplainWithAI}
                    disabled={isAiLoading}
                    className="flex items-center space-x-2 text-xs font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 px-4 py-2 rounded-xl transition active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Explain with AI Tutor</span>
                  </button>

                  <button
                    data-dpad-quiz-item
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 px-5 py-2 rounded-xl shadow transition active:scale-95"
                  >
                    <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Controls & AI Tutor Button for MCQs */}
            {isSubmitted && currentQ.options && currentQ.options.length > 0 && (
              <div className="pt-4 border-t border-border-navy/80 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleExplainWithAI}
                  disabled={isAiLoading}
                  className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95 ${
                    isAiPanelOpen
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-400/50 shadow-inner'
                      : 'text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>
                    {isAiLoading
                      ? 'Analyzing Botswana Syllabus...'
                      : isAiPanelOpen
                      ? 'AI Tutor Side-by-Side Open'
                      : 'Explain with AI Tutor'}
                  </span>
                </button>

                <button
                  data-dpad-quiz-item
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95 outline-none focus:ring-2 focus:ring-brand-cyan ml-auto"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Tutor Side Panel (Split View on Desktop / TV, Stacked on Mobile) */}
        {isAiPanelOpen && (
          <div className="lg:col-span-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-b from-slate-900/95 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative flex flex-col max-h-[85vh]">
              {/* AI Tutor Panel Header */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
                    <Bot className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white tracking-wide">Yivu AI Tutor</h3>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-[11px] text-purple-300/80 font-medium">
                      Botswana Curriculum Breakdown
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-300">
                    {aiSource || 'Curriculum Engine'}
                  </span>
                  <button
                    onClick={() => setIsAiPanelOpen(false)}
                    title="Close AI Tutor Panel"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Tutor Body */}
              <div className="overflow-y-auto py-4 space-y-4 pr-1 text-sm text-slate-200">
                {isAiLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-purple-200">
                      Formulating pedagogical explanation for Grade {activeProfile.gradeKey.toUpperCase()}...
                    </p>
                    <span className="text-[11px] text-slate-400">Referencing official syllabus outcomes</span>
                  </div>
                ) : aiExplanation ? (
                  <div className="space-y-4">
                    {/* Key Curriculum Concept Card */}
                    <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Curriculum Guidance</div>
                        <div className="text-xs text-purple-200/90 mt-0.5">
                          Follow the exact logical steps below to master this examination objective.
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Breakdown Content */}
                    <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-200 space-y-2 whitespace-pre-line font-normal">
                      <MathRenderer text={aiExplanation} />
                    </div>

                    {/* Botswana Attainment Note */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center space-x-2.5 text-[11px] text-slate-400">
                      <BookOpen className="w-4 h-4 text-brand-cyan shrink-0" />
                      <span>Aligned to BEC PSLE / JCE / BGCSE curriculum assessment standards.</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Tap "Explain with AI Tutor" to generate detailed step-by-step guidance.
                  </div>
                )}
              </div>

              {/* Panel Footer */}
              <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Question {currentQ.question_number || currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => setIsAiPanelOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-bold transition active:scale-95"
                >
                  Got it, Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



