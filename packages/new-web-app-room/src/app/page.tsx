'use client';

import { useState, useEffect } from 'react';

interface Habit {
  id: string;
  name: string;
  completedDates: string[];
  streak: number;
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load habits from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  // Save habits to localStorage whenever habits change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        completedDates: [],
        streak: 0
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
      setShowAddForm(false);
    }
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = getTodayString();
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        let newCompletedDates;
        
        if (isCompleted) {
          // Remove today from completed dates
          newCompletedDates = habit.completedDates.filter(date => date !== today);
        } else {
          // Add today to completed dates
          newCompletedDates = [...habit.completedDates, today];
        }
        
        // Calculate streak
        const sortedDates = newCompletedDates.sort().reverse();
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < sortedDates.length; i++) {
          const date = new Date(sortedDates[i]);
          const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === i) {
            streak++;
          } else {
            break;
          }
        }
        
        return {
          ...habit,
          completedDates: newCompletedDates,
          streak
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId));
  };

  const isCompletedToday = (habit: Habit) => {
    return habit.completedDates.includes(getTodayString());
  };

  const getCompletionRate = (habit: Habit) => {
    if (habit.completedDates.length === 0) return 0;
    const daysSinceStart = Math.max(1, habit.completedDates.length);
    return Math.round((habit.completedDates.length / daysSinceStart) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎯 Habit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Build better habits, one day at a time
          </p>
        </div>

        {/* Add Habit Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Add New Habit
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter habit name (e.g., Drink 8 glasses of water)"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                autoFocus
              />
              <button
                onClick={addHabit}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewHabitName('');
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Add your first habit to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        🔥 {habit.streak} day streak
                      </span>
                      <span className="flex items-center gap-1">
                        📊 {getCompletionRate(habit)}% completion
                      </span>
                      <span className="flex items-center gap-1">
                        ✅ {habit.completedDates.length} total completions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabitCompletion(habit.id)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${
                        isCompletedToday(habit)
                          ? 'bg-green-500 border-green-500 text-white scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900'
                      }`}
                    >
                      {isCompletedToday(habit) ? '✓' : ''}
                    </button>
                    
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                      title="Delete habit"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>Keep going! Every day counts towards building better habits. 💪</p>
        </div>
      </div>
    </div>
  );
}

