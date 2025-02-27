import { runFeedbackCorsMiddleware } from "@/src/features/feedback/server/corsMiddleware";
import { type NextApiRequest, type NextApiResponse } from "next";

// Collects feedack from users that do not use the cloud version of the app
export default async function feedbackApiHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runFeedbackCorsMiddleware(req, res);

  try {
    if (!process.env.SLACK_WEBHOOK_FEEDBACK_URL)
      throw new Error("SLACK_WEBHOOK_FEEDBACK_URL is not set");

    const slackResponse = await fetch(process.env.SLACK_WEBHOOK_FEEDBACK_URL, {
      method: "POST",
      body: JSON.stringify({ rawBody: JSON.stringify(req.body, null, 2) }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (slackResponse.status === 200) {
      res.status(200).json({ status: "OK" });
    } else {
      console.error(slackResponse);
      res.status(400).json({ status: "Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ status: "Error" });
  }
}
