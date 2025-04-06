// Direct implementation using fetch API instead of the SDK
export async function getGeminiResponse(prompt: string, context: string) {
  try {
    // Check if API key is configured
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please check your environment variables.');
    }

    console.log('API Key available:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    console.log('Using model: gemini-2.0-flash');

    // Create a structured prompt
    const fullPrompt = `Context: "${context}"
    
Task: ${prompt}

Instructions: Please provide only the modified text without any additional explanations or comments.`;

    console.log('Sending request to Gemini API with prompt:', fullPrompt);

    // Direct API call using fetch
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    console.log('Received response from Gemini API');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    // Extract the text from the response
    let text = '';
    try {
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts[0].text || '';
        }
      }
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error('Failed to parse the AI response');
    }
    
    console.log('Extracted text from Gemini API:', text);
    
    // Check if the response is empty or just whitespace
    if (!text || text.trim() === '') {
      throw new Error('The AI returned an empty response. Please try again.');
    }
    
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for specific error types
      if (error.message.includes('API key')) {
        throw new Error('API key error. Please check your Gemini API key configuration.');
      } else if (error.message.includes('model')) {
        throw new Error('Model error. The AI model is not available or has changed.');
      } else if (error.message.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        // Clean up the error message for display
        const cleanMessage = error.message.replace(/\[GoogleGenerativeAI Error\]:?\s*/i, '');
        throw new Error(`AI service error: ${cleanMessage}`);
      }
    }
    throw new Error('An unexpected error occurred with the AI service.');
  }
} 