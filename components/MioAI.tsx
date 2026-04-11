import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Bot, Minus, LogIn, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp, 
  limit,
  writeBatch,
  onSnapshot,
  where
} from 'firebase/firestore';
import Link from 'next/link';
import useLocalStorage from '../hooks/useLocalStorage';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function MioAI() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [guestMessages, setGuestMessages] = useLocalStorage<Message[]>('mio_guest_chat', [
    { role: 'assistant', content: 'Konnichiwa! I’m Mio, your personal Anime Expert! 🌸 How can I help you today? ✨' }
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from guest storage or Firestore
  useEffect(() => {
    if (!user) {
      setMessages(guestMessages);
    }
  }, [user, guestMessages]);

  // Save guest messages to storage
  useEffect(() => {
    if (!user && messages.length > 0) {
      setGuestMessages(messages.slice(-10)); // Keep only last 10 locally too
    }
  }, [messages, user, setGuestMessages]);

  // Pruning helper for Firestore
  const pruneHistory = async (userId: string) => {
    if (!db) return;
    try {
      const historyRef = collection(db, 'mio_chat');
      const q = query(
        historyRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.size > 10) {
        const batch = writeBatch(db);
        // Keep the first 10 (most recent), delete the rest
        querySnapshot.docs.slice(10).forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error pruning history:", error);
    }
  };

  const isMigrating = useRef(false);

  // Migrate guest messages to cloud on login
  useEffect(() => {
    const migrateGuestMessages = async () => {
      if (user && db && guestMessages.length > 1 && !isMigrating.current) {
        isMigrating.current = true;
        // Skip the first message (welcome message)
        const messagesToMigrate = guestMessages.slice(1);
        
        try {
          const historyRef = collection(db, 'mio_chat');
          
          // Upload in order
          for (const msg of messagesToMigrate) {
            await addDoc(historyRef, {
              ...msg,
              userId: user.uid,
              createdAt: serverTimestamp()
            });
          }
          
          // Clear guest messages locally (back to just welcome message)
          setGuestMessages([
            { role: 'assistant', content: 'Konnichiwa! I’m Mio, your personal Anime Expert! 🌸 How can I help you today? ✨' }
          ]);
          
          // Prune history to keep only 10
          await pruneHistory(user.uid);
        } catch (error) {
          console.error("Error migrating messages:", error);
        } finally {
          isMigrating.current = false;
        }
      }
    };

    if (user) {
      migrateGuestMessages();
    }
  }, [user, guestMessages, setGuestMessages]);

  // Real-Time Sync
  useEffect(() => {
    if (!user || !db || !isOpen) return;
    
    setIsFetchingHistory(true);
    const historyRef = collection(db, 'mio_chat');
    const q = query(
      historyRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'), 
      limit(10)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        historyMessages.push({
          role: data.role,
          content: data.content
        });
      });

      if (historyMessages.length > 0) {
        // Reverse because we fetched latest 10 in desc order
        setMessages(historyMessages.reverse());
      } else {
        // Fallback to welcome message if no history
        setMessages([{ role: 'assistant', content: 'Konnichiwa! I’m Mio, your personal Anime Expert! 🌸 How can I help you today? ✨' }]);
      }
      setIsFetchingHistory(false);
    }, (error) => {
      console.error("Error in history sync:", error);
      setIsFetchingHistory(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Save User Message to Firestore
    if (user && db) {
      try {
        await addDoc(collection(db, 'mio_chat'), {
          ...newMessage,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        // Prune after adding
        pruneHistory(user.uid);
      } catch (error) {
        console.error("Error saving user message:", error);
      }
    }

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      const data = await res.json();
      if (data.reply) {
        const assistantMessage: Message = { role: 'assistant', content: data.reply };
        setMessages(prev => [...prev, assistantMessage].slice(-10));

        // Save Assistant Message to Firestore
        if (user && db) {
          try {
            await addDoc(collection(db, 'mio_chat'), {
              ...assistantMessage,
              userId: user.uid,
              createdAt: serverTimestamp()
            });
            // Prune after adding
            pruneHistory(user.uid);
          } catch (error) {
            console.error("Error saving assistant message:", error);
          }
        }
      } else {
        throw new Error(data.error || 'Failed to get reply');
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Gomen! I hit a little snag. 🌸 Can you try again? ✨' 
      } as Message].slice(-10));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user || !db || !window.confirm("Clear all your chat history with Mio?")) return;
    
    try {
      const historyRef = collection(db, 'mio_chat');
      const q = query(historyRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      
      setMessages([{ role: 'assistant', content: 'History cleared! ✨ How can I help you now?' }]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[90vw] sm:w-[400px] h-[500px] bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-accent/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/20 border border-white/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest text-white">Mio Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {user ? 'Cloud History Sync' : 'Guest Mode'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <button 
                    onClick={clearChat}
                    title="Clear Chat"
                    className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {isFetchingHistory && (
                <div className="flex items-center justify-center py-10 flex-col gap-2">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Syncing History...</span>
                </div>
              )}
              
              {!user && messages.length > 1 && (
                <Link href="/login">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-2 mb-4 p-3 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-between group hover:bg-accent/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                        <LogIn className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-none">Login to Save History</p>
                        <p className="text-[9px] text-gray-400">Keep your chats across devices ✨</p>
                      </div>
                    </div>
                    <div className="text-accent group-hover:translate-x-1 transition-transform">
                      <Send className="w-4 h-4 rotate-45" />
                    </div>
                  </motion.div>
                </Link>
              )}

              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl flex gap-3 ${
                    m.role === 'user' 
                      ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20' 
                      : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {m.role === 'assistant' && <Bot className="w-4 h-4 shrink-0 mt-1 text-accent" />}
                    <div className="text-sm leading-relaxed">{m.content}</div>
                    {m.role === 'user' && <User className="w-4 h-4 shrink-0 mt-1 opacity-60" />}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/40 border-t border-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Mio about anime..."
                  className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white p-2 rounded-xl transition-all active:scale-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (isOpen && isMinimized) setIsMinimized(false);
          else setIsOpen(!isOpen);
        }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 overflow-hidden relative ${
          isOpen ? 'bg-white text-accent' : 'bg-accent text-white'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        {isOpen && !isMinimized ? (
          <X className="w-8 h-8 relative z-10" />
        ) : (
          <MessageCircle className="w-8 h-8 relative z-10" />
        )}
        {/* Unread indicator / Notification pulse */}
        {!isOpen && (
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-accent rounded-full animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
