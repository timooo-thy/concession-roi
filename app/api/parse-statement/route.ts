import { NextRequest, NextResponse } from "next/server";
import { parseStatementPdf, parseStatementText } from "@/lib/pdf-parser";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      const result = await parseStatementPdf(buffer);
      return NextResponse.json(result);
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.text) {
        return NextResponse.json({ error: "No text provided" }, { status: 400 });
      }
      const result = parseStatementText(body.text);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("API parse statement error:", err);
    const msg = err instanceof Error ? err.message : "Failed to parse statement";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
