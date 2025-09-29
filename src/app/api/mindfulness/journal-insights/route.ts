import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { withAuth } from '@/app/api/auth-middleware'

// Initialize Gemini API
const API_KEY = process.env.GOOGLE_AI_API_KEY || 'mock-key-for-development'
const genAI = new GoogleGenerativeAI(API_KEY)

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId, request) => {
    try {
      // Get the journal entry content from the request
      const { entryContent } = await request.json()

      if (!entryContent) {
        return NextResponse.json({ error: 'Journal entry content is required' }, { status: 400 })
      }

      // Check if API key is properly configured
      if (!process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY === 'your_api_key_here') {
        return NextResponse.json({ 
          error: 'AI service is not properly configured',
          insights: 'Unable to generate insights at this time. Please try again later.'
        }, { status: 200 })
      }

      try {
        // Get the model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        // Prepare the prompt for journal insights
        const prompt = `
          You are a compassionate and insightful AI assistant helping with journal reflection.
          
          Please analyze this journal entry and provide thoughtful insights. Include:
          1. Key emotions identified in the entry
          2. Main themes or patterns
          3. Potential growth opportunities
          4. A gentle, supportive reflection
          
          Keep your response concise (around 150-200 words) but meaningful.
          
          Journal entry:
          "${entryContent}"
        `

        // Generate insights
        const result = await model.generateContent(prompt)
        const insights = result.response.text()

        return NextResponse.json({ insights })
      } catch (error: any) {
        console.error('Error generating journal insights:', error)
        
        // Handle specific errors
        if (error.message?.includes('API key')) {
          return NextResponse.json({ 
            error: 'API configuration issue',
            insights: 'Unable to generate insights due to a configuration issue.'
          })
        }
        
        if (error.message?.includes('quota')) {
          return NextResponse.json({ 
            error: 'API quota exceeded',
            insights: 'Unable to generate insights at this time due to high demand. Please try again later.'
          })
        }

        // Generic error response
        return NextResponse.json({ 
          error: 'AI service error',
          insights: 'Unable to generate insights at this time. Please try again later.'
        })
      }
    } catch (error: any) {
      console.error('Error in journal insights API:', error)
      return NextResponse.json({ 
        error: 'Server error',
        insights: 'An unexpected error occurred. Please try again later.'
      }, { status: 500 })
    }
  })
} 