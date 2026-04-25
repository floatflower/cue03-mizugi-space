"use client"

import { useCallback } from "react"

export default function useNewebPay() {
  const submitTransaction = useCallback(
    async (data: {
      merchantId: string
      tradeInfo: string
      tradeSha: string
    }) => {
      const form = document.createElement("form")
      form.method = "POST"
      form.action = `${process.env.NEXT_PUBLIC_NEWEBPAY_GATEWAY_BASE_URL}/MPG/mpg_gateway`

      const addInput = (name: string, value: string) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        form.appendChild(input)
      }

      addInput("MerchantID", data.merchantId)
      addInput("Version", "2.2")
      addInput("TradeSha", data.tradeSha)
      addInput("TradeInfo", data.tradeInfo)
      addInput("EncryptType", "0")

      document.body.appendChild(form)
      form.submit()
    },
    []
  )

  return { submitTransaction }
}
