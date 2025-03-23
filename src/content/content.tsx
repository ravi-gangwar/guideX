import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, Send, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChromeStorage } from '@/hooks/useChromeStorage'
import generateDetailedSteps from '@/lib/generateDetailsSteps'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { gemini } from '@/constants/variables'
import * as Switch from '@radix-ui/react-switch'

interface Step {
  instruction: string
  selector: string
}

interface Message {
  id: number
  text: string
  sender: 'user' | 'assistant'
}

const ChatBox = ({ visible }: { visible: boolean }) => {
  const [apiKey, setApiKey] = useState<string>('')
  const [html, setHtml] = useState<string>('')
  const [websiteContext, setWebsiteContext] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false) // Typing indicator state
  const { getKeyModel } = useChromeStorage()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoClick, setAutoClick] = useState(true)

  useEffect(() => {
    const fetchKeyAndContext = async () => {
      try {
        const key = await getKeyModel(gemini)
        setApiKey(key.apiKey)

        // Extract and clean the webpage HTML
        const doc = document.cloneNode(true) as Document

        // Remove elements injected by extensions
        const extensionSelectors = [
          '[id^="chrome-extension"]',
          '[class*="extension"]',
          '[id^="ext-"]',
          'script[src*="chrome-extension://"]',
          'link[href*="chrome-extension://"]',
          '#__leetcode_ai_whisper_container',
        ]
        extensionSelectors.forEach((selector) => {
          doc.querySelectorAll(selector).forEach((el) => el.remove())
        })

        // Extract only relevant interactive elements
        const interactiveElements = doc.querySelectorAll(
          'a, button, input, select, textarea'
        )
        const elementsData = Array.from(interactiveElements).map((el) => {
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            class: el.className || null,
            name: el.getAttribute('name') || null,
            text: el.textContent?.trim() || null,
            attributes: Object.fromEntries(
              [...el.attributes].map((attr) => [attr.name, attr.value])
            ),
          }
        })

        // Store the cleaned JSON
        setHtml(JSON.stringify(elementsData, null, 2))
        setWebsiteContext(window.location.href)
      } catch (error) {
        console.error('Error fetching API key or filtering HTML', error)
      }
    }

    fetchKeyAndContext()
  }, [getKeyModel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendQuery = useCallback(async () => {
    try {
      const input = document.querySelector('#query-input') as HTMLInputElement
      if (!input || !input.value.trim()) return

      const query = input.value.trim()
      input.value = ''

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: query, sender: 'user' },
      ])
      setLoading(true)

      const detailedSteps = await generateDetailedSteps(
        query,
        websiteContext,
        html,
        apiKey
      )

      // Display each step as a separate message
      for (let i = 0; i < detailedSteps.steps.length; i++) {
        const step = detailedSteps.steps[i]
        const stepMessage = `Step ${i + 1}: ${step.instruction}`

        await new Promise((resolve) => setTimeout(resolve, 500)) // Delay for a smooth effect

        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: stepMessage, sender: 'assistant' },
        ])
      }

      setLoading(false)

      // Highlight steps using driver.js first
      const highlightSteps = detailedSteps.steps.map(
        (step: Step, index: number) => ({
          element: step.selector,
          popover: {
            title: `Step ${index + 1}`,
            description: step.instruction,
          },
        })
      )

      const driverObj = driver({
        showProgress: true,
        steps: highlightSteps,
      })

      driverObj.drive()

      if (autoClick) {
        for (let i = 0; i < detailedSteps.steps.length; i++) {
          const step = detailedSteps.steps[i]

          await new Promise((resolve) => setTimeout(resolve, 1000))
          const element = document.querySelector(step.selector) as HTMLElement
          if (element) element.click()
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'Sorry, something went wrong. Try again.',
          sender: 'assistant',
        },
      ])
      setLoading(false)
    }
  }, [websiteContext, html, apiKey])

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading) sendQuery()
  }

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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Auto-click</span>
                <Switch.Root
                  checked={autoClick}
                  onCheckedChange={() => setAutoClick((prev) => !prev)}
                  className="w-10 h-5 bg-gray-300 rounded-full relative transition"
                >
                  <Switch.Thumb
                    className={`block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                      autoClick ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </Switch.Root>
              </div>
              <span className="text-gray-500 text-sm">Online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white self-end'
                      : 'bg-gray-100 dark:bg-gray-700 self-start'
                  }`}
                >
                  <pre className="whitespace-pre-wrap break-words">
                    {msg.text}
                  </pre>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="self-start flex gap-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 max-w-[80%]">
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-pulse" />
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-pulse delay-75" />
                  <span className="h-2 w-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-pulse delay-150" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Field */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <input
                  id="query-input"
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 dark:text-white text-black rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={handleKeyPress}
                  disabled={loading} // Disable input while loading
                />
                <Button
                  onClick={sendQuery}
                  variant="outline"
                  className="p-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
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
    <div className="fixed bottom-10 right-20 z-[10000]">
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
