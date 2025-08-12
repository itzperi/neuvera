import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const toggleVoiceRecording = () => {
    setIsListening(!isListening);
    // In a real app, this would handle voice recognition
  };

  return (
    <div className="bg-card border-t border-border px-6 py-4 shadow-elegant">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={disabled}
            className="min-h-[52px] max-h-[120px] resize-none bg-muted/50 border-border focus:border-primary transition-colors pr-16 py-4 rounded-2xl"
            rows={1}
          />
          
          {/* Voice recording button */}
          <Button
            type="button"
            variant="voice"
            size="icon"
            onClick={toggleVoiceRecording}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
              isListening ? 'animate-glow-pulse' : ''
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </Button>
        </div>

        <Button
          type="submit"
          variant="premium"
          size="icon"
          disabled={!message.trim() || disabled}
          className="h-[52px] w-[52px] rounded-2xl flex-shrink-0"
        >
          <Send size={20} />
        </Button>
      </form>

      {/* Quick suggestions */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {[
          "What can you help me with?",
          "Tell me a joke",
          "How's the weather?",
          "Help me brainstorm ideas"
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setMessage(suggestion)}
            className="flex-shrink-0 px-3 py-2 text-sm bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-border hover:border-primary/50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};