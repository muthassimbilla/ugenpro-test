import { ImageResponse } from "next/og"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 120,
        background: "#2B7FFF",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "20%",
        fontWeight: "bold",
      }}
    >
      U
    </div>,
    {
      ...size,
    },
  )
}
