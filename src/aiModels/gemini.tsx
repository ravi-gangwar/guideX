import { useChromeStorage } from '@/hooks/useChromeStorage'
import { GoogleGenerativeAI } from '@google/generative-ai'

const useGemini = async (prompt: string) => {
  const { getKeyModel } = useChromeStorage()

  try {
    const apiKey = await (await getKeyModel('gemini')).apiKey

    if (!apiKey) {
      throw new Error(
        'Missing Gemini API key! Please set your API key in Chrome storage.'
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent(prompt)

    return result.response.text()
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error('Failed to generate content from Gemini API')
  }
}

export default useGemini
