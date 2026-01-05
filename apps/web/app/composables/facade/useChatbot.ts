export function useChatbot() {
  const chatbotOpen = ref(false)

  const toggleChatbot = () => {
    chatbotOpen.value = !chatbotOpen.value
  }

  const closeChatbot = () => {
    chatbotOpen.value = false
  }

  return {
    chatbotOpen,
    toggleChatbot,
    closeChatbot,
  }
}
