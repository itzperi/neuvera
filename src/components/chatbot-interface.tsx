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

  // Generate intelligent title based on conversation content
  const generateIntelligentTitle = useCallback((messages: Message[]): string => {
    if (messages.length === 0) return 'New Chat';
    
    // Get all user messages to analyze the topic
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return 'New Chat';
    
    // Combine all user messages for analysis
    const allUserContent = userMessages.map(m => m.content).join(' ').toLowerCase();
    
    // Define topic keywords and their corresponding titles
    const topicKeywords = {
      'sustainable development': 'Discussion on Sustainable Development',
      'sustainability': 'Discussion on Sustainable Development',
      'environment': 'Environmental Discussion',
      'climate': 'Climate Change Discussion',
      'renewable energy': 'Renewable Energy Discussion',
      'programming': 'Programming Discussion',
      'code': 'Programming Discussion',
      'javascript': 'JavaScript Discussion',
      'python': 'Python Discussion',
      'react': 'React Discussion',
      'nextjs': 'Next.js Discussion',
      'ai': 'AI Discussion',
      'artificial intelligence': 'AI Discussion',
      'machine learning': 'Machine Learning Discussion',
      'data science': 'Data Science Discussion',
      'business': 'Business Discussion',
      'marketing': 'Marketing Discussion',
      'finance': 'Finance Discussion',
      'education': 'Educational Discussion',
      'learning': 'Educational Discussion',
      'health': 'Health Discussion',
      'medicine': 'Medical Discussion',
      'technology': 'Technology Discussion',
      'science': 'Science Discussion',
      'research': 'Research Discussion',
      'academic': 'Academic Discussion',
      'university': 'Academic Discussion',
      'college': 'Academic Discussion',
      'assignment': 'Assignment Help',
      'homework': 'Homework Help',
      'project': 'Project Discussion',
      'work': 'Work Discussion',
      'career': 'Career Discussion',
      'job': 'Career Discussion',
      'travel': 'Travel Discussion',
      'food': 'Food Discussion',
      'cooking': 'Cooking Discussion',
      'sports': 'Sports Discussion',
      'fitness': 'Fitness Discussion',
      'music': 'Music Discussion',
      'art': 'Art Discussion',
      'design': 'Design Discussion',
      'photography': 'Photography Discussion',
      'gaming': 'Gaming Discussion',
      'movies': 'Movies Discussion',
      'books': 'Books Discussion',
      'literature': 'Literature Discussion',
      'history': 'History Discussion',
      'politics': 'Politics Discussion',
      'philosophy': 'Philosophy Discussion',
      'psychology': 'Psychology Discussion',
      'sociology': 'Sociology Discussion',
      'economics': 'Economics Discussion',
      'law': 'Legal Discussion',
      'medicine': 'Medical Discussion',
      'engineering': 'Engineering Discussion',
      'mathematics': 'Mathematics Discussion',
      'physics': 'Physics Discussion',
      'chemistry': 'Chemistry Discussion',
      'biology': 'Biology Discussion',
      'geography': 'Geography Discussion',
      'languages': 'Language Discussion',
      'translation': 'Translation Discussion',
      'writing': 'Writing Discussion',
      'communication': 'Communication Discussion',
      'leadership': 'Leadership Discussion',
      'management': 'Management Discussion',
      'entrepreneurship': 'Entrepreneurship Discussion',
      'startup': 'Startup Discussion',
      'investment': 'Investment Discussion',
      'trading': 'Trading Discussion',
      'cryptocurrency': 'Cryptocurrency Discussion',
      'blockchain': 'Blockchain Discussion',
      'web3': 'Web3 Discussion',
      'nft': 'NFT Discussion',
      'metaverse': 'Metaverse Discussion',
      'virtual reality': 'VR Discussion',
      'augmented reality': 'AR Discussion',
      'robotics': 'Robotics Discussion',
      'automation': 'Automation Discussion',
      'cybersecurity': 'Cybersecurity Discussion',
      'privacy': 'Privacy Discussion',
      'ethics': 'Ethics Discussion',
      'morality': 'Ethics Discussion',
      'religion': 'Religious Discussion',
      'spirituality': 'Spiritual Discussion',
      'meditation': 'Meditation Discussion',
      'mindfulness': 'Mindfulness Discussion',
      'yoga': 'Yoga Discussion',
      'fitness': 'Fitness Discussion',
      'nutrition': 'Nutrition Discussion',
      'diet': 'Diet Discussion',
      'weight loss': 'Weight Loss Discussion',
      'mental health': 'Mental Health Discussion',
      'therapy': 'Therapy Discussion',
      'counseling': 'Counseling Discussion',
      'relationships': 'Relationships Discussion',
      'dating': 'Dating Discussion',
      'marriage': 'Marriage Discussion',
      'family': 'Family Discussion',
      'parenting': 'Parenting Discussion',
      'children': 'Children Discussion',
      'pets': 'Pets Discussion',
      'animals': 'Animals Discussion',
      'nature': 'Nature Discussion',
      'gardening': 'Gardening Discussion',
      'hobbies': 'Hobbies Discussion',
      'crafts': 'Crafts Discussion',
      'diy': 'DIY Discussion',
      'home improvement': 'Home Improvement Discussion',
      'interior design': 'Interior Design Discussion',
      'fashion': 'Fashion Discussion',
      'beauty': 'Beauty Discussion',
      'skincare': 'Skincare Discussion',
      'makeup': 'Makeup Discussion',
      'shopping': 'Shopping Discussion',
      'fashion': 'Fashion Discussion',
      'style': 'Style Discussion',
      'lifestyle': 'Lifestyle Discussion',
      'wellness': 'Wellness Discussion',
      'self improvement': 'Self Improvement Discussion',
      'productivity': 'Productivity Discussion',
      'time management': 'Time Management Discussion',
      'organization': 'Organization Discussion',
      'planning': 'Planning Discussion',
      'goal setting': 'Goal Setting Discussion',
      'motivation': 'Motivation Discussion',
      'inspiration': 'Inspiration Discussion',
      'creativity': 'Creativity Discussion',
      'innovation': 'Innovation Discussion',
      'problem solving': 'Problem Solving Discussion',
      'critical thinking': 'Critical Thinking Discussion',
      'decision making': 'Decision Making Discussion',
      'strategy': 'Strategy Discussion',
      'planning': 'Planning Discussion',
      'analysis': 'Analysis Discussion',
      'evaluation': 'Evaluation Discussion',
      'assessment': 'Assessment Discussion',
      'review': 'Review Discussion',
      'feedback': 'Feedback Discussion',
      'criticism': 'Criticism Discussion',
      'suggestion': 'Suggestion Discussion',
      'recommendation': 'Recommendation Discussion',
      'advice': 'Advice Discussion',
      'guidance': 'Guidance Discussion',
      'help': 'Help Discussion',
      'support': 'Support Discussion',
      'assistance': 'Assistance Discussion',
      'tutorial': 'Tutorial Discussion',
      'guide': 'Guide Discussion',
      'instruction': 'Instruction Discussion',
      'explanation': 'Explanation Discussion',
      'clarification': 'Clarification Discussion',
      'question': 'Question Discussion',
      'answer': 'Answer Discussion',
      'solution': 'Solution Discussion',
      'resolution': 'Resolution Discussion',
      'fix': 'Fix Discussion',
      'repair': 'Repair Discussion',
      'maintenance': 'Maintenance Discussion',
      'troubleshooting': 'Troubleshooting Discussion',
      'debugging': 'Debugging Discussion',
      'testing': 'Testing Discussion',
      'quality assurance': 'QA Discussion',
      'quality control': 'QC Discussion',
      'optimization': 'Optimization Discussion',
      'performance': 'Performance Discussion',
      'efficiency': 'Efficiency Discussion',
      'scalability': 'Scalability Discussion',
      'reliability': 'Reliability Discussion',
      'security': 'Security Discussion',
      'safety': 'Safety Discussion',
      'compliance': 'Compliance Discussion',
      'regulation': 'Regulation Discussion',
      'policy': 'Policy Discussion',
      'procedure': 'Procedure Discussion',
      'process': 'Process Discussion',
      'workflow': 'Workflow Discussion',
      'methodology': 'Methodology Discussion',
      'framework': 'Framework Discussion',
      'architecture': 'Architecture Discussion',
      'design pattern': 'Design Pattern Discussion',
      'best practice': 'Best Practice Discussion',
      'standard': 'Standard Discussion',
      'convention': 'Convention Discussion',
      'guideline': 'Guideline Discussion',
      'rule': 'Rule Discussion',
      'principle': 'Principle Discussion',
      'concept': 'Concept Discussion',
      'theory': 'Theory Discussion',
      'hypothesis': 'Hypothesis Discussion',
      'experiment': 'Experiment Discussion',
      'study': 'Study Discussion',
      'survey': 'Survey Discussion',
      'poll': 'Poll Discussion',
      'vote': 'Vote Discussion',
      'election': 'Election Discussion',
      'democracy': 'Democracy Discussion',
      'government': 'Government Discussion',
      'policy': 'Policy Discussion',
      'law': 'Law Discussion',
      'legal': 'Legal Discussion',
      'court': 'Court Discussion',
      'justice': 'Justice Discussion',
      'rights': 'Rights Discussion',
      'freedom': 'Freedom Discussion',
      'liberty': 'Liberty Discussion',
      'equality': 'Equality Discussion',
      'diversity': 'Diversity Discussion',
      'inclusion': 'Inclusion Discussion',
      'discrimination': 'Discrimination Discussion',
      'prejudice': 'Prejudice Discussion',
      'bias': 'Bias Discussion',
      'stereotype': 'Stereotype Discussion',
      'racism': 'Racism Discussion',
      'sexism': 'Sexism Discussion',
      'ageism': 'Ageism Discussion',
      'ableism': 'Ableism Discussion',
      'homophobia': 'Homophobia Discussion',
      'transphobia': 'Transphobia Discussion',
      'xenophobia': 'Xenophobia Discussion',
      'islamophobia': 'Islamophobia Discussion',
      'anti semitism': 'Anti-Semitism Discussion',
      'hate speech': 'Hate Speech Discussion',
      'harassment': 'Harassment Discussion',
      'bullying': 'Bullying Discussion',
      'abuse': 'Abuse Discussion',
      'violence': 'Violence Discussion',
      'crime': 'Crime Discussion',
      'criminal': 'Criminal Discussion',
      'justice': 'Justice Discussion',
      'punishment': 'Punishment Discussion',
      'rehabilitation': 'Rehabilitation Discussion',
      'reform': 'Reform Discussion',
      'change': 'Change Discussion',
      'progress': 'Progress Discussion',
      'development': 'Development Discussion',
      'growth': 'Growth Discussion',
      'improvement': 'Improvement Discussion',
      'advancement': 'Advancement Discussion',
      'innovation': 'Innovation Discussion',
      'invention': 'Invention Discussion',
      'discovery': 'Discovery Discussion',
      'breakthrough': 'Breakthrough Discussion',
      'revolution': 'Revolution Discussion',
      'evolution': 'Evolution Discussion',
      'transformation': 'Transformation Discussion',
      'transition': 'Transition Discussion',
      'migration': 'Migration Discussion',
      'immigration': 'Immigration Discussion',
      'refugee': 'Refugee Discussion',
      'asylum': 'Asylum Discussion',
      'citizenship': 'Citizenship Discussion',
      'nationality': 'Nationality Discussion',
      'identity': 'Identity Discussion',
      'culture': 'Culture Discussion',
      'tradition': 'Tradition Discussion',
      'heritage': 'Heritage Discussion',
      'custom': 'Custom Discussion',
      'ritual': 'Ritual Discussion',
      'ceremony': 'Ceremony Discussion',
      'celebration': 'Celebration Discussion',
      'festival': 'Festival Discussion',
      'holiday': 'Holiday Discussion',
      'vacation': 'Vacation Discussion',
      'trip': 'Trip Discussion',
      'journey': 'Journey Discussion',
      'adventure': 'Adventure Discussion',
      'exploration': 'Exploration Discussion',
      'discovery': 'Discovery Discussion',
      'quest': 'Quest Discussion',
      'mission': 'Mission Discussion',
      'goal': 'Goal Discussion',
      'objective': 'Objective Discussion',
      'target': 'Target Discussion',
      'aim': 'Aim Discussion',
      'purpose': 'Purpose Discussion',
      'meaning': 'Meaning Discussion',
      'significance': 'Significance Discussion',
      'importance': 'Importance Discussion',
      'value': 'Value Discussion',
      'worth': 'Worth Discussion',
      'benefit': 'Benefit Discussion',
      'advantage': 'Advantage Discussion',
      'disadvantage': 'Disadvantage Discussion',
      'pros': 'Pros Discussion',
      'cons': 'Cons Discussion',
      'strength': 'Strength Discussion',
      'weakness': 'Weakness Discussion',
      'opportunity': 'Opportunity Discussion',
      'threat': 'Threat Discussion',
      'risk': 'Risk Discussion',
      'challenge': 'Challenge Discussion',
      'obstacle': 'Obstacle Discussion',
      'barrier': 'Barrier Discussion',
      'limitation': 'Limitation Discussion',
      'constraint': 'Constraint Discussion',
      'restriction': 'Restriction Discussion',
      'regulation': 'Regulation Discussion',
      'rule': 'Rule Discussion',
      'law': 'Law Discussion',
      'policy': 'Policy Discussion',
      'guideline': 'Guideline Discussion',
      'standard': 'Standard Discussion',
      'requirement': 'Requirement Discussion',
      'specification': 'Specification Discussion',
      'criteria': 'Criteria Discussion',
      'condition': 'Condition Discussion',
      'term': 'Term Discussion',
      'agreement': 'Agreement Discussion',
      'contract': 'Contract Discussion',
      'deal': 'Deal Discussion',
      'negotiation': 'Negotiation Discussion',
      'bargain': 'Bargain Discussion',
      'compromise': 'Compromise Discussion',
      'settlement': 'Settlement Discussion',
      'resolution': 'Resolution Discussion',
      'solution': 'Solution Discussion',
      'answer': 'Answer Discussion',
      'response': 'Response Discussion',
      'reply': 'Reply Discussion',
      'feedback': 'Feedback Discussion',
      'comment': 'Comment Discussion',
      'opinion': 'Opinion Discussion',
      'view': 'View Discussion',
      'perspective': 'Perspective Discussion',
      'standpoint': 'Standpoint Discussion',
      'position': 'Position Discussion',
      'stance': 'Stance Discussion',
      'attitude': 'Attitude Discussion',
      'approach': 'Approach Discussion',
      'method': 'Method Discussion',
      'technique': 'Technique Discussion',
      'strategy': 'Strategy Discussion',
      'tactic': 'Tactic Discussion',
      'plan': 'Plan Discussion',
      'scheme': 'Scheme Discussion',
      'project': 'Project Discussion',
      'initiative': 'Initiative Discussion',
      'program': 'Program Discussion',
      'campaign': 'Campaign Discussion',
      'movement': 'Movement Discussion',
      'cause': 'Cause Discussion',
      'mission': 'Mission Discussion',
      'vision': 'Vision Discussion',
      'dream': 'Dream Discussion',
      'aspiration': 'Aspiration Discussion',
      'ambition': 'Ambition Discussion',
      'desire': 'Desire Discussion',
      'wish': 'Wish Discussion',
      'hope': 'Hope Discussion',
      'expectation': 'Expectation Discussion',
      'anticipation': 'Anticipation Discussion',
      'excitement': 'Excitement Discussion',
      'enthusiasm': 'Enthusiasm Discussion',
      'passion': 'Passion Discussion',
      'love': 'Love Discussion',
      'hate': 'Hate Discussion',
      'anger': 'Anger Discussion',
      'fear': 'Fear Discussion',
      'anxiety': 'Anxiety Discussion',
      'worry': 'Worry Discussion',
      'concern': 'Concern Discussion',
      'stress': 'Stress Discussion',
      'pressure': 'Pressure Discussion',
      'tension': 'Tension Discussion',
      'conflict': 'Conflict Discussion',
      'disagreement': 'Disagreement Discussion',
      'argument': 'Argument Discussion',
      'debate': 'Debate Discussion',
      'discussion': 'Discussion',
      'conversation': 'Conversation',
      'chat': 'Chat',
      'talk': 'Talk',
      'dialogue': 'Dialogue',
      'exchange': 'Exchange Discussion',
      'interaction': 'Interaction Discussion',
      'communication': 'Communication Discussion',
      'connection': 'Connection Discussion',
      'relationship': 'Relationship Discussion',
      'bond': 'Bond Discussion',
      'link': 'Link Discussion',
      'tie': 'Tie Discussion',
      'association': 'Association Discussion',
      'partnership': 'Partnership Discussion',
      'collaboration': 'Collaboration Discussion',
      'cooperation': 'Cooperation Discussion',
      'teamwork': 'Teamwork Discussion',
      'unity': 'Unity Discussion',
      'harmony': 'Harmony Discussion',
      'peace': 'Peace Discussion',
      'tranquility': 'Tranquility Discussion',
      'calm': 'Calm Discussion',
      'serenity': 'Serenity Discussion',
      'balance': 'Balance Discussion',
      'equilibrium': 'Equilibrium Discussion',
      'stability': 'Stability Discussion',
      'security': 'Security Discussion',
      'safety': 'Safety Discussion',
      'protection': 'Protection Discussion',
      'defense': 'Defense Discussion',
      'guard': 'Guard Discussion',
      'shield': 'Shield Discussion',
      'barrier': 'Barrier Discussion',
      'wall': 'Wall Discussion',
      'fence': 'Fence Discussion',
      'boundary': 'Boundary Discussion',
      'limit': 'Limit Discussion',
      'edge': 'Edge Discussion',
      'border': 'Border Discussion',
      'frontier': 'Frontier Discussion',
      'territory': 'Territory Discussion',
      'space': 'Space Discussion',
      'area': 'Area Discussion',
      'zone': 'Zone Discussion',
      'region': 'Region Discussion',
      'district': 'District Discussion',
      'neighborhood': 'Neighborhood Discussion',
      'community': 'Community Discussion',
      'society': 'Society Discussion',
      'population': 'Population Discussion',
      'people': 'People Discussion',
      'individual': 'Individual Discussion',
      'person': 'Person Discussion',
      'human': 'Human Discussion',
      'being': 'Being Discussion',
      'existence': 'Existence Discussion',
      'life': 'Life Discussion',
      'living': 'Living Discussion',
      'alive': 'Alive Discussion',
      'dead': 'Dead Discussion',
      'death': 'Death Discussion',
      'dying': 'Dying Discussion',
      'mortality': 'Mortality Discussion',
      'immortality': 'Immortality Discussion',
      'eternity': 'Eternity Discussion',
      'infinity': 'Infinity Discussion',
      'forever': 'Forever Discussion',
      'always': 'Always Discussion',
      'never': 'Never Discussion',
      'sometimes': 'Sometimes Discussion',
      'often': 'Often Discussion',
      'rarely': 'Rarely Discussion',
      'occasionally': 'Occasionally Discussion',
      'frequently': 'Frequently Discussion',
      'constantly': 'Constantly Discussion',
      'continuously': 'Continuously Discussion',
      'permanently': 'Permanently Discussion',
      'temporarily': 'Temporarily Discussion',
      'briefly': 'Briefly Discussion',
      'quickly': 'Quickly Discussion',
      'slowly': 'Slowly Discussion',
      'fast': 'Fast Discussion',
      'rapid': 'Rapid Discussion',
      'swift': 'Swift Discussion',
      'speedy': 'Speedy Discussion',
      'hasty': 'Hasty Discussion',
      'rushed': 'Rushed Discussion',
      'urgent': 'Urgent Discussion',
      'immediate': 'Immediate Discussion',
      'instant': 'Instant Discussion',
      'sudden': 'Sudden Discussion',
      'abrupt': 'Abrupt Discussion',
      'gradual': 'Gradual Discussion',
      'progressive': 'Progressive Discussion',
      'step by step': 'Step by Step Discussion',
      'one by one': 'One by One Discussion',
      'piece by piece': 'Piece by Piece Discussion',
      'bit by bit': 'Bit by Bit Discussion',
      'little by little': 'Little by Little Discussion',
      'day by day': 'Day by Day Discussion',
      'week by week': 'Week by Week Discussion',
      'month by month': 'Month by Month Discussion',
      'year by year': 'Year by Year Discussion',
      'time by time': 'Time by Time Discussion',
      'moment by moment': 'Moment by Moment Discussion',
      'second by second': 'Second by Second Discussion',
      'minute by minute': 'Minute by Minute Discussion',
      'hour by hour': 'Hour by Hour Discussion',
      'daily': 'Daily Discussion',
      'weekly': 'Weekly Discussion',
      'monthly': 'Monthly Discussion',
      'yearly': 'Yearly Discussion',
      'annual': 'Annual Discussion',
      'biannual': 'Biannual Discussion',
      'semiannual': 'Semiannual Discussion',
      'quarterly': 'Quarterly Discussion',
      'bimonthly': 'Bimonthly Discussion',
      'biweekly': 'Biweekly Discussion',
      'fortnightly': 'Fortnightly Discussion',
      'nightly': 'Nightly Discussion',
      'morning': 'Morning Discussion',
      'afternoon': 'Afternoon Discussion',
      'evening': 'Evening Discussion',
      'night': 'Night Discussion',
      'dawn': 'Dawn Discussion',
      'dusk': 'Dusk Discussion',
      'sunrise': 'Sunrise Discussion',
      'sunset': 'Sunset Discussion',
      'noon': 'Noon Discussion',
      'midnight': 'Midnight Discussion',
      'today': 'Today Discussion',
      'yesterday': 'Yesterday Discussion',
      'tomorrow': 'Tomorrow Discussion',
      'now': 'Now Discussion',
      'then': 'Then Discussion',
      'before': 'Before Discussion',
      'after': 'After Discussion',
      'during': 'During Discussion',
      'while': 'While Discussion',
      'when': 'When Discussion',
      'where': 'Where Discussion',
      'why': 'Why Discussion',
      'how': 'How Discussion',
      'what': 'What Discussion',
      'who': 'Who Discussion',
      'which': 'Which Discussion',
      'whose': 'Whose Discussion',
      'whom': 'Whom Discussion',
      'wherever': 'Wherever Discussion',
      'whenever': 'Whenever Discussion',
      'however': 'However Discussion',
      'whatever': 'Whatever Discussion',
      'whoever': 'Whoever Discussion',
      'whichever': 'Whichever Discussion',
      'whomever': 'Whomever Discussion',
      'somewhere': 'Somewhere Discussion',
      'anywhere': 'Anywhere Discussion',
      'everywhere': 'Everywhere Discussion',
      'nowhere': 'Nowhere Discussion',
      'sometime': 'Sometime Discussion',
      'anytime': 'Anytime Discussion',
      'everytime': 'Everytime Discussion',
      'never': 'Never Discussion',
      'somehow': 'Somehow Discussion',
      'anyhow': 'Anyhow Discussion',
      'everyhow': 'Everyhow Discussion',
      'nohow': 'Nohow Discussion',
      'somewhat': 'Somewhat Discussion',
      'anywhat': 'Anywhat Discussion',
      'everywhat': 'Everywhat Discussion',
      'nowhat': 'Nowhat Discussion',
      'someone': 'Someone Discussion',
      'anyone': 'Anyone Discussion',
      'everyone': 'Everyone Discussion',
      'no one': 'No One Discussion',
      'somebody': 'Somebody Discussion',
      'anybody': 'Anybody Discussion',
      'everybody': 'Everybody Discussion',
      'nobody': 'Nobody Discussion',
      'something': 'Something Discussion',
      'anything': 'Anything Discussion',
      'everything': 'Everything Discussion',
      'nothing': 'Nothing Discussion',
      'somewhere': 'Somewhere Discussion',
      'anywhere': 'Anywhere Discussion',
      'everywhere': 'Everywhere Discussion',
      'nowhere': 'Nowhere Discussion',
      'sometime': 'Sometime Discussion',
      'anytime': 'Anytime Discussion',
      'everytime': 'Everytime Discussion',
      'never': 'Never Discussion',
      'somehow': 'Somehow Discussion',
      'anyhow': 'Anyhow Discussion',
      'everyhow': 'Everyhow Discussion',
      'nohow': 'Nohow Discussion',
      'somewhat': 'Somewhat Discussion',
      'anywhat': 'Anywhat Discussion',
      'everywhat': 'Everywhat Discussion',
      'nowhat': 'Nowhat Discussion',
      'someone': 'Someone Discussion',
      'anyone': 'Anyone Discussion',
      'everyone': 'Everyone Discussion',
      'no one': 'No One Discussion',
      'somebody': 'Somebody Discussion',
      'anybody': 'Anybody Discussion',
      'everybody': 'Everybody Discussion',
      'nobody': 'Nobody Discussion',
      'something': 'Something Discussion',
      'anything': 'Anything Discussion',
      'everything': 'Everything Discussion',
      'nothing': 'Nothing Discussion'
    };
    
    // Check for topic matches
    for (const [keyword, title] of Object.entries(topicKeywords)) {
      if (allUserContent.includes(keyword)) {
        return title;
      }
    }
    
    // If no specific topic is found, generate a title from the first user message
    const firstUserMessage = userMessages[0];
    if (firstUserMessage) {
      const words = firstUserMessage.content.split(' ').slice(0, 5);
      return words.join(' ') + (firstUserMessage.content.split(' ').length > 5 ? '...' : '');
    }
    
    return 'New Chat';
  }, []);

  // Update the current session with new messages
  const updateCurrentSession = useCallback((updatedMessages: Message[]) => {
    if (!currentSessionId) return;
    
    setChatSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        // Generate intelligent title based on conversation content
        let title = session.title;
        if (title === 'New Chat' && updatedMessages.length > 0) {
          title = generateIntelligentTitle(updatedMessages);
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
  }, [currentSessionId, generateIntelligentTitle]);

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
      // Prepare messages for API with system message
      const apiMessages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are Neuvera AI, an intelligent and helpful AI assistant. You provide clear, accurate, and helpful responses to user questions. You are knowledgeable about a wide range of topics and can help with various tasks including programming, education, business, science, and general knowledge. Always be polite, professional, and aim to be as helpful as possible.'
        },
        ...newMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      const startTime = performance.now();
      
      // Call DeepSeek API with proper error handling
      console.log('Sending API request to DeepSeek...', { 
        messageCount: apiMessages.length,
        apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ? 'Set' : 'Not set'
      });
      
      const response = await getChatCompletion(apiMessages, {
        temperature: 0.7,
        max_tokens: 1024
      });
      
      console.log('DeepSeek API response received:', response);
      
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
                              // @ts-ignore - 'root' is valid but not in the type definition
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