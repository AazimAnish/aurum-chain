import OpenAI from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY, 
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });


export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages?.length - 1]?.content;
        let docContext = "";

        // Generate embeddings
        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        });

        try {
            // Query Astra DB
            const collection = db.collection(ASTRA_DB_COLLECTION);
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            });
            const documents = await cursor.toArray();
            const docsMap = documents.map(doc => doc.text);
            docContext = JSON.stringify(docsMap);
        } catch (err) {
            console.error("Error querying DB:", err);
            docContext = "";
        }

        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about gold-related details in India. Use the context below to enhance your response. If the context doesn't include the needed information, answer based on your knowledge without referencing the source. Use markdown formatting where applicable.
            ----------------
            START OF CONTEXT
            ${docContext}
            END OF CONTEXT
            ----------------
            QUESTION: ${latestMessage}`
        };

        // Use non-streaming response
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                template, ...messages
            ]
        });

        return Response.json({
            response: response.choices[0].message.content
        });

    } catch (err) {
        console.error("Error:", err);
        return Response.json(
            { error: "Failed to process your request" },
            { status: 500 }
        );
    }
}
