import { NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const params = new URLSearchParams(await request.text())
  const status = params.get("Status")
  const isSuccess = status === "SUCCESS"

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "報名成功" : "付款失敗"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #fafafa; color: #111; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 48px 40px; text-align: center; max-width: 420px; width: 90%; }
    .icon { font-size: 48px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 10px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 28px; }
    a { display: inline-block; padding: 10px 28px; background: #111; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isSuccess ? "✅" : "❌"}</div>
    <h1>${isSuccess ? "報名成功！" : "付款失敗"}</h1>
    <p>${isSuccess ? "感謝您的報名，我們將會寄送電子郵件給您以供確認。" : "付款未能完成，請返回重新嘗試。如有疑問請聯繫主辦單位。"}</p>
    <a href="/">返回首頁</a>
  </div>
</body>
</html>`

  const response = new NextResponse(html)
  response.headers.set("Content-Type", "text/html; charset=utf-8")
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("X-Robots-Tag", "noindex")
  return response
}
