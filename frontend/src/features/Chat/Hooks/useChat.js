import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        
        let targetChatId = chatId;
        let isTemp = false;

        if (!targetChatId) {
            targetChatId = 'temp-' + Date.now();
            isTemp = true;
            dispatch(createNewChat({
                chatId: targetChatId,
                title: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
            }))
            dispatch(setCurrentChatId(targetChatId))
        }

        dispatch(addNewMessage({
            chatId: targetChatId,
            content: message,
            role: "user",
        }))

        try {
            const data = await sendMessage({ message, chatId: isTemp ? null : targetChatId })
            const { chat, aiMessage } = data
            
            let finalChatId = targetChatId;
            if (isTemp) {
                finalChatId = chat._id;
                dispatch({
                    type: 'chat/replaceChatId',
                    payload: { oldId: targetChatId, newId: finalChatId, chatData: chat }
                });
            }

            dispatch(addNewMessage({
                chatId: finalChatId,
                content: aiMessage.content,
                role: aiMessage.role,
            }))
        } catch (error) {
            console.error("Error sending message:", error);
            dispatch(setError(error.message));
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