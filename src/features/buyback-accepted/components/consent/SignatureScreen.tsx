import { useRef, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";

type SignatureScreenProps = {
  onApproved?: () => void;
};

export function SignatureScreen({ onApproved }: SignatureScreenProps) {
  const { setSignature, clearSignature, signatureData, goTo } = useBuyback();
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasStrokes(true);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const handleClear = useCallback(() => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasStrokes(false);
    clearSignature();
  }, [clearSignature]);

  useEffect(() => {
    if (signatureData && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = getCtx();
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setHasStrokes(true);
        }
      };
      img.src = signatureData;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      <Box sx={{ px: 4, py: 2, flexShrink: 0 }}>
        <Typography variant="body1">
          {t("buybackConsentWizard.signature.instruction")}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: 4,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            flex: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "grey.50",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <canvas
            ref={canvasRef}
            width={900}
            height={500}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              touchAction: "none",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteForeverIcon />}
            onClick={handleClear}
            sx={{
              position: "absolute",
              bottom: 12,
              left: 12,
              bgcolor: "background.paper",
            }}
          >
            {t("buybackConsentWizard.common.undo")}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          size="large"
          disabled={!hasStrokes}
          onClick={() => {
            if (onApproved) {
              onApproved();
              return;
            }

            goTo("payment");
          }}
          sx={{ minWidth: 160, height: 52, fontSize: "1rem" }}
        >
          {t("buybackConsentWizard.common.approve")}
        </Button>
      </Box>
    </Box>
  );
}
