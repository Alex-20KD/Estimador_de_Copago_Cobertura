export async function GET() {
  return Response.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      region: process.env.VERCEL_REGION || "default"
    },
    { status: 200 }
  );
}
