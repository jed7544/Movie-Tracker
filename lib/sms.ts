// lib/sms.ts — send SMS alerts via Twilio

import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendSMS(body: string): Promise<void> {
  await client.messages.create({
    body,
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ALERT_TO_NUMBER!,
  })
}
