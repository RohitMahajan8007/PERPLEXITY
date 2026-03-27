import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, replaceChatId } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        
        let targetChatId = chatId;
        let isTemp = false;

        if (!targetChatId || (typeof targetChatId === 'string' && targetChatId.startsWith('temp-'))) {
            isTemp = true;
            if (!targetChatId) {
                targetChatId = 'temp-' + Date.now();
                dispatch(createNewChat({
                    chatId: targetChatId,
                    title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                }))
                dispatch(setCurrentChatId(targetChatId))
            }
        }

        dispatch(addNewMessage({
            chatId: targetChatId,
            content: message,
            role: "user",
        }))

        try {
            const data = await sendMessage({ message, chatId: isTemp ? null : targetChatId })
            const { chat, aiMessage } = data
            
            if (isTemp && chat) {
                dispatch(replaceChatId({ 
                    oldId: targetChatId, 
                    newId: chat._id, 
                    chatData: chat 
                }));
                targetChatId = chat._id;
            }

            dispatch(addNewMessage({
                chatId: targetChatId,
                content: aiMessage.content,
                role: aiMessage.role,
            }))
        } catch (error) {
            console.error("Error sending message:", error);
            dispatch(setError(error.response?.data?.message || "Error sending message"));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

        console.log(chats[ chatId ]?.messages?.length)

        if (!chats[ chatId ]?.messages || chats[ chatId ]?.messages?.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat
    }

}