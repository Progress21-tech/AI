import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { getAuthContext } from '@/lib/auth/server';
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const analysisSchema = z.object({
  executive_summary: z.string(), key_problems: z.array(z.string()), root_causes: z.array(z.string()),
  technology_opportunities: z.array(z.string()), recommended_solutions: z.array(z.string()), priority: z.array(z.string()),
  expected_impact: z.array(z.string()), implementation_roadmap: z.array(z.string()), assumptions: z.array(z.string()), confidence: z.number().min(0).max(1),
});

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const userClient = await createServerSupabaseClient();
  if (!userClient) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  // RLS makes this ownership/admin check authoritative, even if an ID is tampered with.
  const { data: interview } = await userClient.from('interviews').select('id,status,companies(name,industry),interview_questions(question_key,question_text,sequence_number,answers(answer_text,answer_json))').eq('id', params.id).maybeSingle();
  if (!interview) return NextResponse.json({ error: 'Interview not found or not authorized.' }, { status: 404 });
  const answerCount = interview.interview_questions.reduce((total: number, question: { answers: unknown[] }) => total + (question.answers?.length ?? 0), 0);
  if (answerCount < 8) return NextResponse.json({ error: 'More interview data is required before analysis.' }, { status: 422 });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Gemini analysis is not configured.' }, { status: 503 });
  try {
    const prompt = `Analyze this completed business discovery interview. Use only the provided evidence. Return JSON matching this schema: executive_summary, key_problems, root_causes, technology_opportunities, recommended_solutions, priority, expected_impact, implementation_roadmap, assumptions, confidence (0-1).\n\n${JSON.stringify(interview)}`;
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({ model: process.env.AI_MODEL || 'gemini-2.5-flash', contents: [{ role: 'user', parts: [{ text: prompt }] }], config: { responseMimeType: 'application/json' } });
    const analysis = analysisSchema.parse(JSON.parse(response.text || '{}'));
    const service = await createServiceRoleSupabaseClient();
    if (!service) return NextResponse.json({ error: 'Server persistence is not configured.' }, { status: 503 });
    const { error } = await service.from('reports').insert({ interview_id: interview.id, executive_summary: analysis.executive_summary, major_problems: analysis.key_problems, opportunities: analysis.technology_opportunities, roadmap: analysis.implementation_roadmap, raw_ai_output: analysis });
    if (error) throw error;
    await service.from('interviews').update({ status: 'analyzed', completed_at: new Date().toISOString() }).eq('id', interview.id);
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Interview analysis failed:', error.message);
    return NextResponse.json({ error: 'Unable to generate a validated analysis.' }, { status: 502 });
  }
}
