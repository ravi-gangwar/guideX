import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, Edit2 } from 'lucide-react'
import { useChromeStorage } from './hooks/useChromeStorage'

const Popup: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [savedKey, setSavedKey] = useState('')
  const { setKeyModel, getKeyModel } = useChromeStorage()

  useEffect(() => {
    const fetchSavedKey = async () => {
      const result = await getKeyModel('groq')
      if (result.apiKey) {
        setSavedKey(result.apiKey)
      }
    }
    fetchSavedKey()
  }, [])

  const saveApiKey = () => {
    const apiKey = document.getElementById('api-key') as HTMLInputElement
    if (apiKey) {
      setKeyModel(apiKey.value, 'groq')
      setSavedKey(apiKey.value)
      setIsEditing(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return ''
    return key.substring(0, 4) + '*'.repeat(key.length - 4)
  }

  return (
    <div className="w-96 h-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-lg shadow-xl p-4 flex flex-col items-center justify-center border border-gray-300 dark:border-gray-700">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        🚀 guideX
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
        Enhance your browsing experience with this extension.
      </p>

      {savedKey && !isEditing ? (
        <div className="mt-3 w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {maskApiKey(savedKey)}
          </span>
          <Button
            variant="link"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="ml-2"
          >
            <Edit2 size={16} />
          </Button>
        </div>
      ) : (
        <>
          <Input
            id='api-key'
            type="text"
            placeholder="Enter the API Key"
            className="mt-3 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <Button 
            onClick={saveApiKey} 
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all"
          >
            Save
          </Button>
        </>
      )}

      <p className='text-sm flex gap-2 justify-center items-center text-gray-600 dark:text-gray-300 mt-2 text-center'>
        Get your api key
        <a 
          href="https://console.groq.com/keys" 
          className='text-blue-500 flex justify-center items-center gap-1'
          target='_blank'
        >
          here
          <Link size={16} />
        </a>
      </p>
    </div>
  )
}

export default Popup
