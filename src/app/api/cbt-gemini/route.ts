import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_AI_API_KEY || 'mock-key-for-development';
const genAI = new GoogleGenerativeAI(API_KEY);

const cbtContext = `You are an expert in Cognitive Behavioral Therapy (CBT). Your job is to help users identify cognitive distortions, challenge negative thoughts, and reframe them into balanced thoughts. Be concise, clear, and supportive.`;

export async function POST(req: Request) {
  try {
    const { type, ants, distortions, evidenceAgainst, field, context, prompt } = await req.json();
    let aiPrompt = '';

    if (type === 'field_suggestion') {
      if (field === 'ai_summary') {
        // Special handling for AI summary, pointers, and conclusion
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT thought record:
${context}

${prompt}

Format your response like this:
1. First, provide a brief 1-2 sentence summary of their progress so far
2. Then, if requesting pointers, provide 3 specific, helpful pointers as a numbered list
3. If requesting a conclusion, provide a thoughtful conclusion about their thought process and progress

Be empathetic, supportive, and focus on helping them gain insight into their thought patterns.`;
      } else if (field === 'ants') {
        // Specific prompt for ANTs suggestions
        aiPrompt = `${cbtContext}
Given the situation: "${context}"

Suggest 3 possible automatic negative thoughts (ANTs) that someone might have in this situation. These should be common, believable negative thoughts that reflect cognitive distortions. Output as a numbered list.`;
      } else if (field === 'behaviors') {
        // Specific prompt for behaviors suggestions - using all previous context
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT process so far:
${context}

Suggest 3 common behavioral responses or reactions someone might have to these negative thoughts. Include both avoidance behaviors and emotional reactions. Make sure your suggestions are directly related to the specific situation and ANTs described. Output as a numbered list.`;
      } else if (field === 'distortions') {
        // Enhanced prompt for distortion suggestions - using all previous context
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT process so far:
${context}

Identify 3 cognitive distortions that might be present in these thoughts and behaviors. For each distortion, briefly explain why it applies to this specific situation. Output the distortion names only as a numbered list.`;
      } else if (field === 'evidenceAgainst') {
        // Enhanced prompt for evidence against suggestions - using all previous context
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT process so far:
${context}

Suggest 3 specific pieces of evidence or facts that might contradict or challenge the negative thoughts identified. Be specific and realistic, tailoring your response to this particular situation and the distortions identified. Output as a numbered list.`;
      } else if (field === 'friendsAdvice') {
        // Enhanced prompt for friend's advice suggestions - using all previous context
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT process so far:
${context}

Suggest 3 compassionate, balanced perspectives that a friend might offer to someone experiencing these specific thoughts and behaviors. Focus on validation, perspective, and encouragement that directly addresses the situation, ANTs, and distortions identified. Output as a numbered list.`;
      } else if (field === 'balancedThought') {
        // Enhanced prompt for balanced thought suggestions - using all previous context
        aiPrompt = `${cbtContext}
Based on the following information from the user's CBT process so far:
${context}

Suggest 3 balanced, realistic alternative thoughts that acknowledge both challenges and strengths. These should be believable, not overly positive statements that directly address the specific negative thoughts and distortions identified earlier. Incorporate the evidence against and friend's advice perspectives when crafting these balanced thoughts. Output as a numbered list.`;
      } else {
        aiPrompt = `${cbtContext}
Given the following information from the user:
${context}

Suggest 2-3 possible ${field === 'distortions' ? 'cognitive distortions' : prompt.toLowerCase()} for the next step. Output as a list.`;
      }
    } else if (type === 'distortion_suggestion') {
      aiPrompt = `Analyze the following negative thought: '${ants}'. Based on common cognitive distortions, identify which ones are most likely present. Output only the names of the distortions as a comma-separated list.`;
    } else if (type === 'challenge_prompt') {
      aiPrompt = `Given the negative thought '${ants}' and the identified distortion(s) '${distortions}', what specific evidence could you look for to challenge this? Output 2-3 open-ended questions.`;
    } else if (type === 'balanced_thought') {
      aiPrompt = `Based on the negative thought '${ants}', the identified distortions '${distortions}', and the evidence against '${evidenceAgainst}', suggest 2-3 alternative, more balanced thoughts. Ensure they are realistic and not overly positive. Output as a numbered list.`;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Check if API key is properly configured
    if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your_api_key_here') {
      return NextResponse.json({ response: 'AI service is not configured.' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const result = await model.generateContent(aiPrompt);
    if (!result.response) throw new Error('No response from model');
    const response = result.response.text();
    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
