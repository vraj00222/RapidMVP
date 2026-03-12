import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({
      status: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
