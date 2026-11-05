import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCurriculumStore } from '../store/useCurriculumStore';
import { useUserStore } from '../store/useUserStore';
import type { Question } from '../core/types/curriculum';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Star,
  Award
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
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const materialTitle = location.state?.material?.title || 'Examination Practice';

  useEffect(() => {
    async function loadQuestions() {
      if (!materialId) return;
      setIsLoading(true);
      const paper = await getPaperById(materialId);
      if (paper && paper.questions && paper.questions.length > 0) {
        setQuestions(paper.questions);
      }
      setIsLoading(false);
    }
    loadQuestions();
  }, [materialId]);

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (index: number) => {
    if (isSubmitted) return;
    setSelectedAnswerIndex(index);
    setIsSubmitted(true);
    setAiExplanation(null);

    const isCorrect = index === currentQ.correct_index;
    if (isCorrect) {
      setEarnedXP((prev) => prev + 10);
      setEarnedStars((prev) => prev + 1);
      addXP(10);
      addStars(1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsSubmitted(false);
      setAiExplanation(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleExplainWithAI = () => {
    setIsAiLoading(true);
    setAiExplanation(null);

    // Dynamic educational tutor response mimicking Gemini
    setTimeout(() => {
      const correctText = currentQ.options[currentQ.correct_index] || 'The designated answer';
      const chosenText = selectedAnswerIndex !== null ? currentQ.options[selectedAnswerIndex] : 'No choice';

      let promptExp = `Let's break down this concept carefully for ${activeProfile.gradeKey.toUpperCase().replace('_', ' ')}:\n\n`;
      promptExp += `• Key Requirement: ${currentQ.prompt}\n`;
      promptExp += `• Correct Answer: "${correctText}".\n`;
      if (currentQ.explanation) {
        promptExp += `• Syllabus Rule: ${currentQ.explanation}\n`;
      }
      if (selectedAnswerIndex !== currentQ.correct_index) {
        promptExp += `\nYou chose "${chosenText}". Pay close attention to unit conversions or place values when solving this type of curriculum question.`;
      } else {
        promptExp += `\nGreat job! You identified the proper rule. Keep going!`;
      }

      setAiExplanation(promptExp);
      setIsAiLoading(false);
    }, 600);
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

  // Finished Results Screen
  if (isFinished) {
    return (
      <div className="max-w-md mx-auto mt-8 bg-surface-navy border border-border-navy rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-gold-star/20 border-2 border-gold-star text-gold-star flex items-center justify-center mx-auto text-4xl shadow-lg">
          🏆
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white">Quiz Completed!</h2>
          <p className="text-xs text-slate-400 mt-1">Excellent practice session, {activeProfile.displayName}!</p>
        </div>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="bg-dark-navy p-4 rounded-2xl border border-border-navy">
            <div className="text-2xl font-extrabold text-gold-star flex items-center justify-center space-x-1">
              <Star className="w-6 h-6 fill-current" />
              <span>+{earnedStars}</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">Stars Earned</div>
          </div>
          <div className="bg-dark-navy p-4 rounded-2xl border border-border-navy">
            <div className="text-2xl font-extrabold text-brand-cyan flex items-center justify-center space-x-1">
              <Award className="w-6 h-6" />
              <span>+{earnedXP}</span>
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1">XP Gained</div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedAnswerIndex(null);
              setIsSubmitted(false);
              setIsFinished(false);
              setAiExplanation(null);
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-dark-navy hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-border-navy transition active:scale-95"
          >
            Back to Materials
          </button>
        </div>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Question Tracker Header */}
      <div className="flex items-center justify-between bg-surface-navy border border-border-navy p-4 rounded-2xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-brand-cyan bg-brand-cyan/20 px-2.5 py-1 rounded-md border border-brand-cyan/30">
            Q{currentQ.question_number || currentIndex + 1} of {questions.length}
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline truncate max-w-xs">
            {materialTitle}
          </span>
        </div>

        {/* Live Rewards */}
        <div className="flex items-center space-x-3 text-xs font-bold">
          <span className="text-gold-star">⭐ {earnedStars}</span>
          <span className="text-brand-cyan">⚡ {earnedXP} XP</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-surface-navy border border-border-navy rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {currentQ.question_type || 'Multiple Choice Question'}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {(currentQ.options || []).map((option, idx) => {
            let optionStyles = 'bg-dark-navy/80 border-border-navy hover:bg-slate-800 text-slate-200';

            if (isSubmitted) {
              if (idx === currentQ.correct_index) {
                optionStyles = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-md';
              } else if (idx === selectedAnswerIndex) {
                optionStyles = 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md';
              } else {
                optionStyles = 'opacity-40 border-border-navy text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => handleSelectAnswer(idx)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition duration-150 active:scale-[0.99] ${optionStyles}`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className="w-8 h-8 rounded-xl bg-surface-navy border border-border-navy flex items-center justify-center text-xs font-bold text-white">
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="text-sm font-semibold">{option}</span>
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

        {/* Action Controls & AI Tutor Button */}
        {isSubmitted && (
          <div className="pt-4 border-t border-border-navy/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleExplainWithAI}
              disabled={isAiLoading}
              className="flex items-center space-x-2 text-xs font-bold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 px-4 py-2.5 rounded-xl transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{isAiLoading ? 'Gemini AI Analyzing...' : 'Explain with AI Tutor'}</span>
            </button>

            <button
              onClick={handleNextQuestion}
              className="flex items-center space-x-2 text-xs font-bold text-white bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Explanation Box */}
        {aiExplanation && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/40 text-purple-200 text-xs leading-relaxed font-medium space-y-2">
            <div className="flex items-center space-x-2 font-bold text-purple-300 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini AI Tutor Syllabus Breakdown</span>
            </div>
            <p className="whitespace-pre-line text-slate-200">{aiExplanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};
