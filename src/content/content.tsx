import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ChatBox = ({ visible }: { visible: boolean }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white absolute dark:bg-gray-800 rounded-xl shadow-2xl w-96 h-[500px] p-4 bottom-20 right-10 z-50 border border-gray-300 dark:border-gray-700 backdrop-blur-md"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b pb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <span className="text-gray-500 text-sm">Online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 w-3/4">
                Hello! How can I help you?
              </div>
              <div className="bg-blue-500 text-white rounded-lg p-3 w-3/4 self-end">
                I need help with a feature.
              </div>
            </div>

            {/* Input Field */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="outline" className="p-2">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ContentPage: React.FC = () => {
  const [showChatbox, setShowChatbox] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <ChatBox visible={showChatbox} />
      <Button
        size="icon"
        onClick={() => setShowChatbox((prev) => !prev)}
        className="shadow-lg transition-all duration-200 hover:scale-110"
      >
        <Bot />
      </Button>
    </div>
  )
}

export default ContentPage
