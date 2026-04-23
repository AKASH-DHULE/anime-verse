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
import DOMPurify from 'isomorphic-dompurify';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const formatMessage = (content: string) => {
  if (!content) return { __html: '' };
  
  const html = content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent/90 font-bold">$1</strong>')
    .replace(/\* \*\*(.*?)\*\*/g, '<strong class="text-accent/90 font-bold mt-2 block">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-md text-accent text-[11px] font-mono">$1</code>')
    .replace(/^- (.*)$/gm, '<div class="flex gap-2.5 mt-1.5 mb-1"><span class="text-accent font-black text-[10px] mt-1">✦</span><span class="flex-1">$1</span></div>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br />');
    
  return { __html: DOMPurify.sanitize(html) };
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

  const guestInitialized = useRef(false);

  // Initialize messages from guest storage or Firestore
  useEffect(() => {
    if (!user) {
      if (!guestInitialized.current) {
        setMessages(guestMessages);
        guestInitialized.current = true;
      }
    } else {
      guestInitialized.current = false;
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
            initial={{ opacity: 0, y: 24, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 24, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[95vw] sm:w-[400px] h-[75vh] sm:h-[600px] max-h-[800px] bg-[#09090b]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(255,45,122,0.15)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-white/[0.03] border-b border-white/5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,45,122,0.3)] border border-white/20">
                  <Sparkles className="w-4 h-4 text-white hover:rotate-180 transition-transform duration-700" />
                </div>
                <div>
                  <h3 className="font-black text-[13px] uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Mio Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      {user ? 'Secured Cloud Sync' : 'Local Guest Mode'}
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
                  initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3.5 rounded-2xl flex gap-3 ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-br from-accent to-accent-700 text-white rounded-tr-[4px] shadow-[0_4px_20px_-5px_rgba(255,45,122,0.4)]' 
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-[4px] shadow-sm'
                  }`}>
                    {m.role === 'assistant' && <div className="w-6 h-6 shrink-0 bg-accent/10 rounded-full flex justify-center items-center mt-1"><Bot className="w-3.5 h-3.5 text-accent" /></div>}
                    <div 
                      className="text-[13px] sm:text-sm leading-relaxed tracking-wide font-medium"
                      dangerouslySetInnerHTML={formatMessage(m.content)}
                    />
                    {m.role === 'user' && <User className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                  className="flex justify-start"
                >
                  <div className="bg-white/5 p-3.5 rounded-2xl rounded-tl-[4px] border border-white/10 flex gap-2 items-center shadow-lg">
                    <Bot className="w-3.5 h-3.5 text-accent animate-pulse mr-1" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.15s]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </motion.div>
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
                  placeholder="Ask Mio anything... ✨"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 focus:bg-white/10 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-accent hover:bg-accent/80 hover:shadow-[0_0_15px_rgba(255,45,122,0.5)] disabled:opacity-50 disabled:hover:shadow-none text-white p-2.5 rounded-xl transition-all active:scale-95"
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
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_-5px_rgba(255,45,122,0.4)] hover:shadow-[0_0_40px_rgba(255,45,122,0.6)] transition-all duration-500 overflow-hidden relative group ${
          isOpen ? 'bg-white text-accent' : 'bg-gradient-to-br from-accent to-accent-700 text-white'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        {isOpen && !isMinimized ? (
          <X className="w-7 h-7 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform duration-300" />
        )}
        {/* Unread indicator / Notification pulse */}
        {!isOpen && (
          <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-accent rounded-full animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
