'use client';

import React, { useState } from 'react';
import { QuestionType } from '@/lib/ai/types';
import { Check } from 'lucide-react';

interface AnswerInputsProps {
  type: QuestionType;
  options?: string[];
  onSubmit: (answerText?: string, selectedOptions?: string[]) => void;
  disabled?: boolean;
}

export const AnswerInputs: React.FC<AnswerInputsProps> = ({
  type,
  options = [],
  onSubmit,
  disabled = false,
}) => {
  const [selectedSingle, setSelectedSingle] = useState<string>('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [textInput, setTextInput] = useState<string>('');

  const handleSingleSelect = (option: string) => {
    setSelectedSingle(option);
    onSubmit(option, [option]);
  };

  const toggleMultiSelect = (option: string) => {
    if (selectedMulti.includes(option)) {
      setSelectedMulti(selectedMulti.filter((o) => o !== option));
    } else {
      setSelectedMulti([...selectedMulti, option]);
    }
  };

  const handleMultiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMulti.length === 0) return;
    onSubmit(selectedMulti.join(', '), selectedMulti);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onSubmit(textInput.trim(), [textInput.trim()]);
  };

  // 1. Single Choice (PRD Section 10.1)
  if (type === 'single_choice') {
    return (
      <div className="flex flex-col gap-2.5 w-full mt-4">
        {options.map((option, idx) => {
          const isSelected = selectedSingle === option;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSingleSelect(option)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                isSelected
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-black border-borderDark hover:bg-surface hover:border-black'
              }`}
            >
              <span>{option}</span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-white border-white text-black' : 'border-subtle'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Multiple Choice (PRD Section 10.2)
  if (type === 'multiple_choice') {
    return (
      <form onSubmit={handleMultiSubmit} className="flex flex-col gap-3 w-full mt-4">
        {options.map((option, idx) => {
          const isChecked = selectedMulti.includes(option);
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => toggleMultiSelect(option)}
              className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                isChecked
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-black border-borderDark hover:bg-surface'
              }`}
            >
              <span>{option}</span>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isChecked ? 'bg-white border-white text-black' : 'border-subtle'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}

        <button
          type="submit"
          disabled={disabled || selectedMulti.length === 0}
          className="mt-2 w-full py-3.5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Confirm Selection ({selectedMulti.length})
        </button>
      </form>
    );
  }

  // 3. Short Text / Numeric (PRD Section 10.3)
  if (type === 'short_text') {
    return (
      <form onSubmit={handleTextSubmit} className="flex flex-col gap-3 w-full mt-4">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type your answer here..."
          disabled={disabled}
          autoFocus
          className="w-full p-4 rounded-xl border border-borderDark bg-surface text-black text-sm placeholder:text-subtle focus:outline-none focus:border-black focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={disabled || !textInput.trim()}
          className="w-full py-3.5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Submit Answer
        </button>
      </form>
    );
  }

  // 4. Open Ended (PRD Section 10.4)
  return (
    <form onSubmit={handleTextSubmit} className="flex flex-col gap-3 w-full mt-4">
      <textarea
        rows={4}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Explain in your own words..."
        disabled={disabled}
        autoFocus
        className="w-full p-4 rounded-xl border border-borderDark bg-surface text-black text-sm placeholder:text-subtle focus:outline-none focus:border-black focus:bg-white transition-all resize-none"
      />
      <button
        type="submit"
        disabled={disabled || !textInput.trim()}
        className="w-full py-3.5 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Submit Explanation
      </button>
    </form>
  );
};
