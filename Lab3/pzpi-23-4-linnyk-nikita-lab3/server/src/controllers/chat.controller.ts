import {Request, Response, NextFunction} from "express";
import {prisma} from "../lib/prisma.js";
import * as chatService from "../services/chat.service.js";

// Request body types
type ConversationBody = {
    title: string;
    isGroup: boolean;
    participantIds: string[];
}

// TODO: Add validation; split controllers and services
export const createConversation = async (
    req: Request<{}, {}, ConversationBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        const {title, isGroup, participantIds} = req.body;

        const newConversation = await prisma.conversation.create({
            data: {
                title: title || 'New chat',
                isGroup: isGroup || false,
                participants: {
                    create: participantIds.map(userId => ({
                        participantId: userId,
                        participantType: 'user'
                    }))
                }
            },
            include: {
                participants: true
            }
        })

        res.status(201).json({
            message: 'Conversation created successfully',
            conversation: newConversation
        })
    } catch (err) {
        next(err)
    }
}

export const sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { conversationId } = req.params;
        const { senderId, content } = req.body;

        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversationId,
                senderId: senderId,
                content: content,
                senderType: 'user'
            }
        });

        res.status(201).json({
            message: "Message sent successfully",
            sentMessage: newMessage
        });
    } catch (err) {
        next(err);
    }
};

export const getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { conversationId } = req.params;

        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: { username: true, userId: true }
                }
            }
        });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });
    } catch (err) {
        next(err)
    }
};

export const deleteMessage = async (
    req: Request<{ conversationId: string, messageId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const { conversationId, messageId } = req.params;

        const deletedMessage = await
            chatService.deleteMessage(conversationId, messageId);

        res.status(200).json({
            message: "Message deleted successfully",
            deletedMessage
        });
    } catch (err) {
        next(err);
    }
}