import { ImageResponse } from "next/og";

export const alt = "ISStudio Store — Soluções digitais para vender e escalar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#050508",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(112, 72, 245, 0.45)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(53, 224, 214, 0.28)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #8b72ff 0%, #35e0d6 100%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "#050508",
                transform: "rotate(45deg)",
                borderRadius: 3,
                display: "flex",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 36,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: -0.5,
            }}
          >
            ISStudio Store
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.12,
              letterSpacing: -1.2,
              maxWidth: 920,
            }}
          >
            Soluções digitais para vender e escalar
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 880,
              lineHeight: 1.35,
            }}
          >
            Sistemas · APIs · Templates · SaaS · IA · White Label · Hospedagem
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
