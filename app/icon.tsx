import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#df5275", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="320" height="320" viewBox="0 0 320 320">
        <rect x="20" y="20" width="280" height="280" rx="76" fill="white" />
        <path d="M132 97 Q122 91 122 105 V215 Q122 229 134 221 L220 169 Q234 160 220 151 Z" fill="#df5275" />
      </svg>
    </div>,
    size,
  );
}
