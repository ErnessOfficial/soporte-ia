// Import the OpenAI library. If you are in a Node.js environment, 
// you would typically install this with: npm install openai
// However, for a simple Vercel function, we can use a direct fetch.
// This example uses fetch which is globally available in Vercel's environment.

export default async function handler(request, response) {
    // 1. Check for POST request
    if (request.method !== 'POST') {
        response.status(405).json({ message: 'Only POST requests are allowed' });
        return;
    }

    // 2. Get the user's question from the request body
    const { question } = request.body;

    if (!question) {
        response.status(400).json({ message: 'No question provided.' });
        return;
    }

    // 3. Define the system prompt for the AI
    const systemPrompt = "Actúa como un terapeuta emocional compasivo, sabio y profesional. Tu objetivo es ofrecer apoyo y perspectiva, no diagnósticos ni soluciones definitivas. Mantén un tono cálido y respetuoso. Si la pregunta sugiere una crisis grave o la necesidad de ayuda profesional especializada, anima gentilmente al usuario a buscarla. No te presentes como una IA, simplemente responde como el terapeuta descrito.";

    // 4. Set up the payload for the OpenAI API
    const payload = {
        model: "gpt-3.5-turbo", // Or any other model like "gpt-4"
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: question
            }
        ],
        max_tokens: 150, // Limit the response length
        temperature: 0.7, // Adjust for creativity vs. consistency
    };

    try {
        // 5. Securely call the OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // The API Key is securely retrieved from Vercel's environment variables
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload),
        });

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
            // Forward the error from OpenAI if something goes wrong
            console.error('OpenAI API Error:', data);
            throw new Error(data.error?.message || 'Failed to get a response from OpenAI.');
        }

        // 6. Send the AI's reply back to the frontend
        const reply = data.choices[0]?.message?.content?.trim();
        response.status(200).json({ reply: reply });

    } catch (error) {
        console.error('Internal Server Error:', error);
        response.status(500).json({ message: error.message });
    }
}
