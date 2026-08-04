/**
 * app/api/disease-detections/predict/route.ts
 * Proxy endpoint untuk disease detection ML (ml-tumbu / FastAPI).
 */

import { NextRequest, NextResponse } from "next/server";

// Vercel max duration — butuh 60 detik untuk Gemini API
export const maxDuration = 60;

const ML_API_URL =
  process.env.ML_API_URL ??
  process.env.DISEASE_API_URL ??
  "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi minimal
    if (!body.image_base64 || typeof body.image_base64 !== "string") {
      return NextResponse.json(
        { error: "Field image_base64 wajib diisi." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

    let mlResponse: Response;
    try {
      mlResponse = await fetch(`${ML_API_URL}/predict-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: body.image_base64,
          top: body.top ?? 3,
          disease_only: body.disease_only ?? false,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      const isAbort =
        fetchErr instanceof Error && fetchErr.name === "AbortError";
      return NextResponse.json(
        {
          error: isAbort
            ? "Timeout: ML server tidak merespon dalam 30 detik."
            : "Tidak dapat terhubung ke ML server. Pastikan ml-tumbu sudah berjalan.",
          hint: `Jalankan: cd ml-tumbu-main && uvicorn app:app --port 8000 (atau set ML_API_URL di .env)`,
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!mlResponse.ok) {
      const errBody = await mlResponse.text();
      return NextResponse.json(
        { error: `ML server error ${mlResponse.status}`, detail: errBody },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[POST /api/disease-detections/predict]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Health-check: verifikasi koneksi ke ML server */
export async function GET() {
  try {
    const res = await fetch(`${ML_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ ml_api_url: ML_API_URL, ml_status: data });
  } catch {
    return NextResponse.json(
      {
        ml_api_url: ML_API_URL,
        ml_status: "unreachable",
        hint: "Jalankan: cd ml-tumbu-main && uvicorn app:app --port 8000",
      },
      { status: 503 }
    );
  }
}
