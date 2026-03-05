// Room tour または資料請求が送信されたときに、客と管理者にメールを送る（Resend 使用）

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Tokyo Housing <onboarding@resend.dev>';
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') || '';

type TourPayload = {
  type: 'tour';
  userEmail: string;
  userName: string;
  propertyId: number;
  propertyTitle?: string;
  candidateDates?: { date: string; timeRange: string }[];
};

type InquiryPayload = {
  type: 'inquiry';
  email: string;
  name: string;
  propertyId: number;
  propertyTitle?: string;
};

type ConsultationPayload = {
  type: 'consultation';
  name: string;
  email: string;
  phone?: string;
  interest: 'rent' | 'buy';
  preferredDate?: string;
  preferOnlineMeeting?: boolean;
  message?: string;
};

type Payload = TourPayload | InquiryPayload | ConsultationPayload;

function isTour(p: Payload): p is TourPayload {
  return p.type === 'tour';
}
function isInquiry(p: Payload): p is InquiryPayload {
  return p.type === 'inquiry';
}

async function sendResend(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return { ok: false, error: 'RESEND_API_KEY not configured' };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error', res.status, err);
    return { ok: false, error: err };
  }
  return { ok: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let payload: Payload;
  try {
    payload = (await req.json()) as Payload;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!payload || !payload.type) {
    return new Response(JSON.stringify({ error: 'Missing type or payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const results: { to: string; ok: boolean; error?: string }[] = [];

  if (payload.type === 'consultation') {
    const { name, email, phone, interest, preferredDate, preferOnlineMeeting, message } = payload as ConsultationPayload;
    const interestLabel = interest === 'rent' ? 'Renting a property' : 'Buying a property';
    const meetingLabel = preferOnlineMeeting ? 'Online meeting preferred' : 'In-person or as discussed';
    const dateLine = preferredDate ? `<p><strong>Preferred date:</strong> ${preferredDate}</p>` : '';
    const messageLine = message?.trim() ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>` : '';

    const customerHtml = `
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for requesting a free consultation.</p>
      <p>We've received your details and a staff member will contact you within 24 hours to schedule your consultation.</p>
      <p>Best regards,<br/>Tokyo Housing</p>
    `;
    const r1 = await sendResend(email, 'Free consultation request received – Tokyo Housing', customerHtml);
    results.push({ to: email, ok: r1.ok, error: r1.error });

    if (OWNER_EMAIL) {
      const ownerHtml = `
        <p><strong>New free consultation request</strong></p>
        <p>Name: ${name || '—'}</p>
        <p>Email: ${email}</p>
        ${phone ? `<p>Phone: ${phone}</p>` : ''}
        <p>Interest: ${interestLabel}</p>
        ${dateLine}
        <p>Meeting: ${meetingLabel}</p>
        ${messageLine}
      `;
      const r2 = await sendResend(OWNER_EMAIL, `[Tokyo Housing] Free consultation: ${name || email}`, ownerHtml);
      results.push({ to: OWNER_EMAIL, ok: r2.ok, error: r2.error });
    }
  } else if (isTour(payload)) {
    const { userEmail, userName, propertyTitle, propertyId, candidateDates } = payload;
    const title = propertyTitle || `Property #${propertyId}`;
    const datesList = candidateDates?.length
      ? candidateDates.map((c) => `${c.date} ${c.timeRange}`).join('<br/>')
      : 'Not specified';

    const customerHtml = `
      <p>Hello ${userName || 'there'},</p>
      <p>Thank you for requesting a room tour.</p>
      <p><strong>Property:</strong> ${title}</p>
      <p><strong>Preferred dates:</strong></p>
      <p>${datesList}</p>
      <p>A staff member will contact you within 24 hours to confirm your viewing.</p>
      <p>Best regards,<br/>Tokyo Housing</p>
    `;
    const r1 = await sendResend(userEmail, 'Room tour request received – Tokyo Housing', customerHtml);
    results.push({ to: userEmail, ok: r1.ok, error: r1.error });

    if (OWNER_EMAIL) {
      const ownerHtml = `
        <p><strong>New room tour request</strong></p>
        <p>Customer: ${userName || '—'} &lt;${userEmail}&gt;</p>
        <p>Property: ${title} (ID: ${propertyId})</p>
        <p>Preferred dates:</p>
        <p>${datesList}</p>
      `;
      const r2 = await sendResend(OWNER_EMAIL, `[Tokyo Housing] Room tour request: ${title}`, ownerHtml);
      results.push({ to: OWNER_EMAIL, ok: r2.ok, error: r2.error });
    }
  } else if (isInquiry(payload)) {
    const { email, name, propertyTitle, propertyId } = payload;
    const title = propertyTitle || `Property #${propertyId}`;

    const customerHtml = `
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for your request for property details.</p>
      <p><strong>Property:</strong> ${title}</p>
      <p>A staff member will contact you within 24 hours with availability and full details.</p>
      <p>Best regards,<br/>Tokyo Housing</p>
    `;
    const r1 = await sendResend(email, 'Property details request received – Tokyo Housing', customerHtml);
    results.push({ to: email, ok: r1.ok, error: r1.error });

    if (OWNER_EMAIL) {
      const ownerHtml = `
        <p><strong>New property details request</strong></p>
        <p>Customer: ${name || '—'} &lt;${email}&gt;</p>
        <p>Property: ${title} (ID: ${propertyId})</p>
      `;
      const r2 = await sendResend(OWNER_EMAIL, `[Tokyo Housing] Details request: ${title}`, ownerHtml);
      results.push({ to: OWNER_EMAIL, ok: r2.ok, error: r2.error });
    }
  }

  const hasError = results.some((r) => !r.ok);
  return new Response(JSON.stringify({ results }), {
    status: hasError ? 500 : 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});
