'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMindfulness } from '@/hooks/useMindfulness';
import { useAuth } from '@/hooks/useAuth';
import { JournalEntry } from '@/lib/mindfulness';

interface EnhancedJournalProps {
  onClose: () => void;
  onNextActivity?: () => void;
}

// Utility function to detect mobile Chrome
function isMobileChrome() {
  const ua = navigator.userAgent;
  return /Mobi|Android/i.test(ua) && /Chrome/i.test(ua);
}

// Improved browser capability detection
function getSpeechRecognitionSupport() {
  const SpeechRecognition = 
    (window as any).SpeechRecognition || 
    (window as any).webkitSpeechRecognition || 
    (window as any).mozSpeechRecognition || 
    (window as any).msSpeechRecognition;
  
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isChrome = /Chrome/i.test(navigator.userAgent);
  
  return {
    hasAPI: !!SpeechRecognition,
    isMobile,
    isSafari,
    isChrome,
    useNativeInput: isMobile, // Recommend native input for all mobile devices
    canUseWebAPI: !!SpeechRecognition && !(isMobile && isChrome) // Chrome mobile has issues
  };
}

export default function EnhancedJournal({ onClose, onNextActivity }: EnhancedJournalProps) {
  const { user } = useAuth();
  const { entries, isLoading, createJournalEntry, updateEntry, deleteEntry } = useMindfulness({ type: 'journal', autoFetch: true });
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState('😊');
  const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const recognitionRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'past'>('new');
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  // New states for AI insights
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  const moods = ['😊', '😌', '😐', '😔', '😢'];
  const moodLabels = ['Happy', 'Content', 'Neutral', 'Sad', 'Very Sad'];
  
  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    
    await createJournalEntry(journalText, selectedMood);
    setJournalText('');
    setShowSavedAnimation(true);
    setTimeout(() => setShowSavedAnimation(false), 1500);
  };
  
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition || 
      (window as any).mozSpeechRecognition || 
      (window as any).msSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setTranscriptionText(transcript);
        setJournalText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        // Do not auto-restart. Only update state.
        setIsRecording(false);
      };
    }
    
    return () => {
      if (recognitionRef.current && isRecording) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
    };
  }, []); // Remove dependencies to avoid re-initializing

  const startRecording = async () => {
    try {
      const support = getSpeechRecognitionSupport();
      
      if (!support.hasAPI) {
        showVoiceInputHelp("Your browser doesn't support voice recognition. Please try using your keyboard's voice input feature.");
        return;
      }
      
      if (support.useNativeInput) {
        // Show helpful tooltip for mobile users
        showVoiceInputHelp("Tap the microphone icon on your keyboard for best results");
        
        // Focus the textarea to bring up the keyboard
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
        return;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        throw new Error("Speech recognition not available");
      }
    } catch (error) {
      console.error('Error accessing speech recognition:', error);
      showVoiceInputHelp("Please try your keyboard's voice typing feature");
    }
  };
  
  // Helper function to show voice input guidance
  const showVoiceInputHelp = (message: string) => {
    // Show a tooltip or alert with helpful message
    alert(message);
    
    // You could also implement a more elegant tooltip/popup here
    // setVoiceInputHelpMessage(message);
    // setShowVoiceInputHelp(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    await deleteEntry(id);
  };
  
  const handleTogglePrivacy = async (entry: JournalEntry) => {
    await updateEntry(entry.id, { is_private: !entry.is_private });
  };
  
  const handleCopyToClipboard = (text: string, entryId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEntryId(entryId);
      setTimeout(() => setCopiedEntryId(null), 2000);
    });
  };
  
  // New function to get AI insights for the latest journal entry
  const getAiInsights = async () => {
    if (entries.length === 0) return;
    
    const latestEntry = entries[0] as JournalEntry;
    setIsLoadingInsights(true);
    setAiInsights(null);
    
    try {
      const response = await fetch('/api/mindfulness/journal-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entryContent: latestEntry.content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get insights');
      }
      
      const data = await response.json();
      setAiInsights(data.insights);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      setAiInsights('Unable to generate insights at this time. Please try again later.');
    } finally {
      setIsLoadingInsights(false);
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col" style={{ minHeight: '500px' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Journal</h2>
          <p className="text-sm text-gray-500">Express your thoughts and feelings in a safe space, delete anytime</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      {/* Tab Switcher */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium focus:outline-none ${activeTab === 'new' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('new')}
        >
          New Entry
        </button>
        <button
          className={`px-4 py-2 font-medium focus:outline-none ${activeTab === 'past' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Reflections
        </button>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'new' ? (
          <div className="space-y-6">
            {/* New journal entry */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">How are you feeling today?</h3>
              
              <div className="space-y-4">
                <div>
                  {/*<label className="block text-sm font-medium text-gray-700 mb-2">Mood</label> */}
                  <div className="flex justify-between items-center bg-white rounded-lg p-2 border border-gray-200">
                    {moods.map((mood, index) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          selectedMood === mood
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-2xl">{mood}</span>
                        <span className="text-xs mt-1">{moodLabels[index]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Write your thoughts
                  </label>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full p-3 border border-gray-300 rounded-lg h-40"
                  />
                </div>
                
                

                <div className="flex items-center space-x-2">
                  {/* Voice recording section with live transcription */}
                <div className="space-y-2">
                  {isRecording && (
                    <div className="bg-white p-3 border border-blue-200 rounded-lg text-sm">
                      <div className="flex items-center mb-1">
                        <span className="material-icons mr-2 text-red-500 animate-pulse">mic</span>
                        <span className="font-medium">Recording...</span>
                      </div>
                      
                     {/* <p className="text-gray-700 italic">
                        {transcriptionText || "Speak now..."}
                      </p> */}
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex-1 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                      <span className="material-icons mr-2">
                        {isRecording ? 'stop' : 'mic'}
                      </span>
                      {isRecording ? 'Stop Recording' : 'Voice Entry'}
                    </Button>
                    
                    {getSpeechRecognitionSupport().useNativeInput && (
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="material-icons text-xs mr-1">info</span>
                        Tap the microphone on your keyboard for best results
                      </div>
                    )}
                  </div>
                </div>
                  
                  <Button
                    onClick={handleSaveJournal}
                    disabled={!journalText.trim() || isLoading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    {isLoading ? 'Saving...' : 'Save Entry'}
                  </Button>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                {onNextActivity && (
                  <Button
                    onClick={onNextActivity}
                    //className="w-full mt-3 bg-green-500 hover:bg-green-600"
                    variant="outline"
                    className="w-full mt-3 rounded-full"
                  >
                    Next Activity
                  </Button>
                )}
              </div>
            </div>
            {showSavedAnimation && (
              <div className="items-center justify-center animate-fade-in-out">
                <span className="material-icons text-green-500 text-3xl mr-2">check_circle</span>
                <span className="text-green-600 font-semibold text-lg">Succesfully saved, check Past Reflections!</span>
              </div>
            )}
          </div>
        ) : (
          // Past entries tab
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Your Journal Entries</h3>
              {entries.length > 0 && (
                <Button
                  onClick={getAiInsights}
                  disabled={isLoadingInsights || entries.length === 0}
                  className="bg-purple-600 hover:bg-purple-700 text-sm"
                >
                  {isLoadingInsights ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-1">psychology</span>
                      Get AI Insights
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* AI Insights Section */}
            {aiInsights && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-purple-600 mr-2">psychology</span>
                  <h4 className="font-medium text-purple-800">AI Insights</h4>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{aiInsights}</p>
              </div>
            )}
            
            {isLoading && entries.length === 0 ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-500">Loading your entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven't added any journal entries yet.</p>
                <p className="text-gray-500 text-sm">Start journaling today to track your thoughts and feelings.</p>
              </div> 
            ) : (
              <div className="space-y-4">
                {(entries as JournalEntry[]).map(entry => (
                  <div 
                    key={entry.id} 
                    className="border rounded-lg p-4 relative group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{entry.mood}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Privacy indicator */}
                      <button
                        //onClick={() => handleTogglePrivacy(entry)}
                        className="p-1 rounded-full hover:bg-gray-100"
                       // title={entry.is_private ? "Private entry": "Public entry"}
                       title={ "Private entry"}
                      >
                        {entry.is_private ? (
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
                    
                    <div className="mt-3 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyToClipboard(entry.content, entry.id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                        title="Copy to clipboard"
                      >
                        {copiedEntryId === entry.id ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteJournal(entry.id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-red-500"
                        title="Delete entry"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 