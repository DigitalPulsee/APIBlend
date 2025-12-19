import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
})

export async function POST(req: Request) {
  try {
    const { message, language } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    // Usando gemini-pro que es más estable en la v1beta si flash falla
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `Actúa como un experto en programación y automatización de APIs.
            Lenguaje preferido: ${language || 'Cualquiera'}
            Usuario pregunta: ${message}
            
            Responde de forma concisa, técnica y útil. Si piden código, proporciónalo con explicaciones breves.`
        }]
      }]
    })

    return NextResponse.json({ response: response.text })
  } catch (error: any) {
    console.error('Gemini API Error:', error)
    // Reintento con gemini-pro si flash falla
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-pro',
        contents: [{
          role: 'user',
          parts: [{
            text: `Usuario pregunta: ${message}`
          }]
        }]
      })
      return NextResponse.json({ response: response.text })
    } catch (innerError: any) {
      return NextResponse.json({ error: innerError.message }, { status: 500 })
    }
  }
}
