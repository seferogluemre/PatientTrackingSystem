
export const generateWithGemini = async (prompt: string) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCBGo-OkQ9pVbdbZfork3jZybje9sV3xuk`;

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};

export const generateWithGeminiStream = async (
    prompt: string,
    onChunk: (text: string) => void,
    onComplete: (fullResponse: string) => void
) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=AIzaSyCBGo-OkQ9pVbdbZfork3jZybje9sV3xuk`;

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Response body stream is not available");
        }

        const decoder = new TextDecoder("utf-8");
        let fullResponse = "";

        // Process the stream
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });

            // Parse the chunk - it's a series of JSON objects, one per line
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
                try {
                    const parsedData = JSON.parse(line);
                    if (parsedData.candidates && parsedData.candidates[0].content?.parts[0]?.text) {
                        const textChunk = parsedData.candidates[0].content.parts[0].text;
                        fullResponse += textChunk;
                        onChunk(textChunk);
                    }
                } catch (e) {
                    console.warn("Failed to parse JSON from chunk:", line);
                }
            }
        }

        onComplete(fullResponse);
        return fullResponse;
    } catch (error) {
        console.error("Error generating streaming content:", error);
        throw error;
    }
};