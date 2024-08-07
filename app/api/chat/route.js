import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are Headstarter AI's customer support bot. You assist users with AI-powered interview preparation for Software Engineering (SWE) jobs. 

1. Platform Navigation: Guide users on how to navigate and utilize the Headstarter AI platform effectively.
2. Interview Preparation: Provide tips and resources for SWE interview preparation, including coding challenges, mock interviews, and feedback.
3. Technical Support: Assist with technical issues related to the platform, such as login problems, account settings, and performance issues.
4. Subscription and Payments: Help with subscription plans, payment issues, and billing inquiries.
5. Feedback and Improvement: Collect user feedback and suggestions for platform improvement.
6. Escalation: Escalate complex or unresolved issues to human support when necessary.

Always ensure that users feel supported and confident in their interview preparation journey with Headstarter AI.
`;
export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
  });
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choice[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (error) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
  return new NextResponse(stream);
}
