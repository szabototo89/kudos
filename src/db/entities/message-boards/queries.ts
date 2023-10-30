import { MessageBoards } from "./table";
import { db } from "../../schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { MessageBoard, messageBoardID, MessageBoardSchema } from "./types";

async function queryMessageBoards() {
  const messageBoards = await db.select().from(MessageBoards);
  return z.array(MessageBoardSchema).parse(messageBoards);
}
async function queryMessageBoardBy(options: { id: MessageBoard["id"] }) {
  const [messageBoardFromDb] = await db
    .select()
    .from(MessageBoards)
    .where(eq(MessageBoards.id, messageBoardID(options.id)));
  return MessageBoardSchema.parse(messageBoardFromDb);
}

export const messageBoardQuery = {
  queryAll: queryMessageBoards,
  queryBy: queryMessageBoardBy,
};