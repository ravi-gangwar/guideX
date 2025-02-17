export const useChromeStorage = () => {
  return {
    setKeyModel: async (apiKey: string, model: string) => {
      chrome.storage.local.set({ [model]: apiKey })
    },

    getKeyModel: async (model: string) => {
      const result = await chrome.storage.local.get(model)
      return { model: model, apiKey: result[model] }
    },

    setSelectModel: async (model: string) => {
      await chrome.storage.local.set({ ['selectedModel']: model })
    },

    selectModel: async () => {
      const result = await chrome.storage.local.get('selectedModel')
      return result['selectedModel'] as string;
    },
  }
}
