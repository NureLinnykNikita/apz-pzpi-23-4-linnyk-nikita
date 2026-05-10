import {prisma} from "../lib/prisma.js";

export const deleteMessage = async (conversationId: string, messageId: string) => {
    const message = await prisma.message.findUnique({where: {messageId: messageId}});

    if (!message) {
        throw new Error('Message not found');
    }

    return prisma.message.delete({where: {messageId: messageId}});
};