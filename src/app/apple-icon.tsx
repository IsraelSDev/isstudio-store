import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple Touch Icon — mesma marca do favicon */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #8b72ff 0%, #35e0d6 100%)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: "#050508",
            transform: "rotate(45deg)",
            borderRadius: 10,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
