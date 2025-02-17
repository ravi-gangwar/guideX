import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChromeStorage } from '@/hooks/useChromeStorage';
import generateDetailedSteps from '@/lib/generateDetailsSteps';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface StepDetail {
  tag: string;
  id: string;
  class: string;
  name: string;
  other: string;
}

interface Step {
  details: StepDetail;
  instruction: string;
  selector: string;
  type: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

const ChatBox = ({ visible }: { visible: boolean }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [websiteContext, setWebsiteContext] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { getKeyModel } = useChromeStorage();

  useEffect(() => {
    const fetchKeyAndContext = async () => {
      try {
        const key = await getKeyModel('groq');
        setApiKey(key.apiKey);
        setHtml(document.documentElement.outerHTML);
        setWebsiteContext(window.location.href);
      } catch (error) {
        console.error('Error fetching API key');
      }
    };
    fetchKeyAndContext();
  }, [getKeyModel]);

  const sendQuery = useCallback(async () => {
    try {
      const input = document.querySelector('#query-input') as HTMLInputElement;
      if (!input || !input.value.trim()) return;

      const query = input.value.trim();
      input.value = ''; // Clear input field after sending

      setMessages((prev) => [...prev, { id: Date.now(), text: query, sender: 'user' }]);

      const detailedSteps = await generateDetailedSteps(query, websiteContext, html, apiKey);
      console.log(detailedSteps);
      if (!detailedSteps || !detailedSteps.steps || !Array.isArray(detailedSteps.steps)) {
        throw new Error('Invalid response format');
      }

      // Format steps into a readable message
      const stepsMessage = detailedSteps.steps.map((step: Step, index: number) => {
        return `Step ${index + 1}: ${step.instruction}`;
      }).join('\n');

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: stepsMessage, sender: 'assistant' },
      ]);

      // Create driver.js steps from detailed steps
      const highlightSteps = detailedSteps.steps.map((step: Step, index: number) => ({
        element: step.selector, // Target element
        popover: {
          title: `Step ${index + 1}`,
          description: step.instruction,
        },
      }));

      // Initialize driver.js instance and start it
      const driverObj = driver({
        showProgress: true,
        steps: highlightSteps,
      });
      driverObj.drive();
    } catch (error) {
      console.error('Error sending query');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I encountered an error processing your request. Please try again.",
          sender: 'assistant',
        },
      ]);
    }
  }, [websiteContext, html, apiKey]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white absolute dark:bg-gray-800 rounded-xl shadow-2xl w-[400px] h-[500px] p-4 bottom-20 right-10 z-50 border border-gray-300 dark:border-gray-700 backdrop-blur-md"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b pb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <span className="text-gray-500 text-sm">Online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-100 dark:bg-gray-700 self-start'
                  }`}
                >
                  <pre className="whitespace-pre-wrap break-words">{msg.text}</pre>
                </div>
              ))}
            </div>

            {/* Input Field */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <input
                  id="query-input"
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 dark:text-white text-black rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={sendQuery} variant="outline" className="p-2">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ContentPage: React.FC = () => {
  const [showChatbox, setShowChatbox] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-10000">
      <ChatBox visible={showChatbox} />
      <Button
        size="icon"
        onClick={() => setShowChatbox((prev) => !prev)}
        className="shadow-lg transition-all duration-200 hover:scale-110"
      >
        <Bot />
      </Button>
    </div>
  );
};

export default ContentPage;
