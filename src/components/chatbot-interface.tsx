"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquarePlus, 
  Send, 
  ChevronDown, 
  Menu, 
  X, 
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { getChatCompletion, ChatMessage } from '@/lib/groq-api';
import { trackChatMessage, trackEvent } from '@/lib/tracking-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatbotInterfaceProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
}

export default function ChatbotInterface({ isAuthenticated, onLogout, onNavigate }: ChatbotInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  
  // Generate a fallback response when the API call fails
  const generateFallbackResponse = (userMessage: string): string => {
    const fallbackResponses = [
      "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
      "It seems there's a temporary issue with my response system. Could you please try your question again shortly?",
      "I apologize for the inconvenience, but I'm experiencing a brief technical hiccup. Please try again soon.",
      "I'm currently having difficulty processing your request. This is likely a temporary issue that will be resolved shortly."
    ];
    
    // Choose a random fallback response
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  };

  // Create a new chat session
  const createNewSession = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChatSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([]);
    
    return newSessionId;
  }, []);

  // Update the current session with new messages
  const updateCurrentSession = useCallback((updatedMessages: Message[]) => {
    if (!currentSessionId) return;
    
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Update session title based on first user message if it's a new conversation
        let title = session.title;
        if (title === 'New Chat' && updatedMessages.length > 0) {
          const firstUserMessage = updatedMessages.find(m => m.role === 'user');
          if (firstUserMessage) {
            title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
          }
        }
        
        return {
          ...session,
          title,
          messages: updatedMessages,
          updatedAt: new Date()
        };
      }
      return session;
    }));
  }, [currentSessionId]);

  // Send a message to the chatbot
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Create user message
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    // Ensure we have a session
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }
    
    // Add user message to state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateCurrentSession(newMessages);
    
    // Track user message for analytics
    trackChatMessage(userMessageId, 'user', content.trim());
    
    try {
      // Prepare messages for API
      const apiMessages: ChatMessage[] = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const startTime = performance.now();
      
      // Call Groq API with proper error handling
      const response = await getChatCompletion(apiMessages, {
        temperature: 0.7,
        max_tokens: 1024
      });
      
      const responseTime = performance.now() - startTime;
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantContent = response.choices[0].message.content;
      
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: assistantContent,
        role: 'assistant',
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
      
      // Track assistant response for analytics
      trackChatMessage(
        assistantMessageId, 
        'assistant', 
        assistantContent, 
        responseTime
      );
      
      trackEvent('chat', 'response_received', { 
        messageId: assistantMessageId,
        sessionId: currentSessionId,
        responseTime,
        tokenCount: response.usage?.total_tokens || 0
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Generate fallback response when API call fails
      const fallbackContent = generateFallbackResponse(content.trim());
      const fallbackMessageId = (Date.now() + 1).toString();
      
      const fallbackMessage: Message = {
        id: fallbackMessageId,
        content: fallbackContent,
        role: 'assistant',
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, fallbackMessage];
      setMessages(finalMessages);
      updateCurrentSession(finalMessages);
      
      // Track error for analytics
      trackEvent('chat', 'api_error', { 
        messageId: fallbackMessageId,
        sessionId: currentSessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Show more specific error message based on error type
      if (error instanceof Error && error.message.includes('rate limit')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, currentSessionId, createNewSession, updateCurrentSession]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage]);

  useEffect(() => {
    // Initialize with a default session
    if (chatSessions.length === 0) {
      createNewSession();
    }
    
    // Track page view when component mounts
    trackEvent('page', 'chat_interface_view', {
      theme: theme || 'system'
    });
  }, [chatSessions.length, createNewSession, theme]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-muted/50 border-r border-border transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Neuvera AI</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4">
            <Button 
              className="w-full justify-start gap-2" 
              onClick={createNewSession}
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          
          {/* Chat History */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 py-2">
              {chatSessions.map(session => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "secondary" : "ghost"}
                  className="w-full justify-start truncate text-left"
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setMessages(session.messages);
                  }}
                >
                  <span className="truncate">{session.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
          
          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              <ThemeToggle />
              
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2" 
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
              
              {!isAuthenticated && (
                <Button 
                  variant="ghost" 
                  className="justify-start gap-2" 
                  onClick={() => onNavigate && onNavigate('login')}
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Neuvera AI</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onNavigate && onNavigate('settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Chat Messages */}
        <ScrollArea 
          ref={scrollAreaRef} 
          className="flex-1 p-4"
          onScroll={(e) => {
            const target = e.currentTarget;
            const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
            setShowScrollToBottom(!isNearBottom);
          }}
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md">
                  Ask me anything about your data, analytics, or general questions. I'm here to assist!  
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div
                        className={`rounded-xl p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                      >
                        {message.role === 'assistant' ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              root: ({children}) => <div className="prose prose-sm dark:prose-invert max-w-none">{children}</div>,
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-sm font-mono">
                                    {children}
                                  </code>
                                ) : (
                                  <code className={className}>{children}</code>
                                );
                              },
                              pre: ({ children }) => (
                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>
                      <div
                        className={`text-xs text-muted-foreground ${
                          message.role === 'user' ? 'text-right' : ''
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-start space-x-4"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex items-center space-x-2 bg-muted p-4 rounded-xl">
                      <div className="flex space-x-1">
                        <span className="animate-bounce h-2 w-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                        <span className="animate-bounce h-2 w-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                        <span className="animate-bounce h-2 w-2 rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Neuvera is thinking...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Send a message..."
                  disabled={isLoading}
                  className="pr-12 min-h-[50px] rounded-xl border-border bg-muted/50 focus:bg-background transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send. Neuvera AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}