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
    <div className="bg-background border-t border-border/50 px-4 py-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
        {message.length === 0 ? (
          /* Voice-first input when no text */
          <div className="flex-1 flex items-center justify-center">
            <Button
              type="button"
              onClick={toggleVoiceRecording}
              className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                isListening ? 'scale-110 shadow-2xl' : ''
              }`}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>
          </div>
        ) : (
          /* Text input with inline voice button */
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={disabled}
              className="min-h-[48px] max-h-[120px] resize-none bg-muted/30 border-border/50 focus:border-primary/50 transition-colors pr-12 py-3 rounded-2xl text-sm"
              rows={1}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleVoiceRecording}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
            >
              <Mic size={16} className="text-muted-foreground" />
            </Button>
          </div>
        )}

        {message.trim() && (
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
          >
            <Send size={18} />
          </Button>
        )}
      </form>

      {/* Quick action buttons - only show when no message */}
      {message.length === 0 && (
        <div className="flex gap-3 mt-4 max-w-4xl mx-auto justify-center flex-wrap">
          <Button
            onClick={() => setMessage("How can I help you today?")}
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-2xl px-6 py-3 text-sm font-medium transition-colors"
            variant="outline"
          >
            💬 Chat with bot
          </Button>
          <Button
            onClick={() => setMessage("I'm feeling stressed today")}
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20 rounded-2xl px-6 py-3 text-sm font-medium transition-colors"
            variant="outline"
          >
            🧠 Talk with bot
          </Button>
        </div>
      )}
    </div>
  );
};