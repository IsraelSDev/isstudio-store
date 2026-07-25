import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon PNG da marca ISStudio */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #8b72ff 0%, #35e0d6 100%)",
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            background: "#050508",
            transform: "rotate(45deg)",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
