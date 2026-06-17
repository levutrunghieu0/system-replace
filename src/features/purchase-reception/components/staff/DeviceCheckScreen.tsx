import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import { useReception } from "../../context/ReceptionContext";

const DEVICE_LABEL_KEYS: Record<string, string> = {
  "スマートフォン/タブレット": "smartphoneTablet",
  パソコン: "computer",
  スマートウォッチ: "smartWatch",
  AirPods: "airPods",
  自転車: "bicycle",
};

type DeviceEntry = {
  carrier: string;
  quantity: number;
  memo: string;
};

const quantityIconButtonSx = {
  width: 32,
  height: 32,
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  bgcolor: "common.white",
  "& .MuiSvgIcon-root": { fontSize: 18 },
};

const quantityFieldSx = {
  width: 52,
  "& .MuiInputBase-root": {
    height: 32,
  },
  "& input": {
    py: 0,
    textAlign: "center",
    fontWeight: 700,
  },
};

export function DeviceCheckScreen() {
  const { t } = useTranslation();
  const { deviceCheckTarget, setDeviceCheckDone, goTo } = useReception();
  const [deviceCount, setDeviceCount] = useState(1);
  const [initializedOk, setInitializedOk] = useState<boolean | null>(null);
  const [simRemoved, setSimRemoved] = useState<boolean | null>(null);
  const [entries, setEntries] = useState<DeviceEntry[]>([
    { carrier: "", quantity: 1, memo: "" },
  ]);
  const carrierOptions = t(
    "purchaseReceptionWizard.deviceCheck.carrierOptions",
    { returnObjects: true },
  ) as string[];

  const addEntry = () =>
    setEntries((prev) => [...prev, { carrier: "", quantity: 1, memo: "" }]);

  const updateEntry = (index: number, patch: Partial<DeviceEntry>) =>
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );

  const handleComplete = () => {
    if (deviceCheckTarget) {
      setDeviceCheckDone(deviceCheckTarget, deviceCount);
    }
    goTo("staff-confirm");
  };

  const getDeviceLabel = (value?: string | null) => {
    if (!value) return t("purchaseReceptionWizard.deviceCheck.defaultTitle");
    const key = DEVICE_LABEL_KEYS[value];
    return key ? t(`purchaseReceptionWizard.staff.item.${key}`) : value;
  };

  const title = getDeviceLabel(deviceCheckTarget);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <IconButton
          onClick={() => goTo("staff-confirm")}
          aria-label={t("purchaseReceptionWizard.common.back")}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t("purchaseReceptionWizard.deviceCheck.title", { item: title })}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{ color: "white", fontSize: 12, fontWeight: 700 }}
              >
                {t("purchaseReceptionWizard.deviceCheck.hearingBadge")}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {t("purchaseReceptionWizard.deviceCheck.hearingTitle")}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2">
                {t("purchaseReceptionWizard.deviceCheck.q1", { item: title })}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  aria-label={t("purchaseReceptionWizard.common.decrease")}
                  onClick={() =>
                    setDeviceCount((count) => Math.max(1, count - 1))
                  }
                  sx={quantityIconButtonSx}
                >
                  <RemoveIcon />
                </IconButton>
                <Box
                  sx={{
                    width: 52,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "common.white",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {deviceCount}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label={t("purchaseReceptionWizard.common.increase")}
                  onClick={() => setDeviceCount((count) => count + 1)}
                  sx={quantityIconButtonSx}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t("purchaseReceptionWizard.deviceCheck.q2")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, ml: 2 }}>
                <Button
                  size="small"
                  variant={initializedOk === false ? "contained" : "outlined"}
                  color={initializedOk === false ? "warning" : "inherit"}
                  onClick={() => setInitializedOk(false)}
                >
                  {t("purchaseReceptionWizard.common.noQuoted")}
                </Button>
                <Button
                  size="small"
                  variant={initializedOk === true ? "contained" : "outlined"}
                  onClick={() => setInitializedOk(true)}
                >
                  {t("purchaseReceptionWizard.common.yesQuoted")}
                </Button>
              </Box>
              {initializedOk === false && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="body2" color="error.main">
                    {t(
                      "purchaseReceptionWizard.deviceCheck.initializedNoGuide1",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      "purchaseReceptionWizard.deviceCheck.initializedNoGuide2",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(
                      "purchaseReceptionWizard.deviceCheck.initializedNoGuide3",
                    )}
                  </Typography>
                </Box>
              )}
              {initializedOk === true && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {t("purchaseReceptionWizard.deviceCheck.goToQ4")}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {t("purchaseReceptionWizard.deviceCheck.q3")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, ml: 2 }}>
                <Button
                  size="small"
                  variant={simRemoved === false ? "contained" : "outlined"}
                  color={simRemoved === false ? "warning" : "inherit"}
                  onClick={() => setSimRemoved(false)}
                >
                  {t("purchaseReceptionWizard.common.noQuoted")}
                </Button>
                <Button
                  size="small"
                  variant={simRemoved === true ? "contained" : "outlined"}
                  onClick={() => setSimRemoved(true)}
                >
                  {t("purchaseReceptionWizard.common.yesQuoted")}
                </Button>
              </Box>
              {simRemoved === false && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="body2" color="error.main">
                    {t("purchaseReceptionWizard.deviceCheck.simNoGuide1")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("purchaseReceptionWizard.deviceCheck.simNoGuide2")}
                  </Typography>
                </Box>
              )}
              {simRemoved === true && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {t("purchaseReceptionWizard.deviceCheck.goToQ4")}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("purchaseReceptionWizard.deviceCheck.q4")}
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {t("purchaseReceptionWizard.deviceCheck.q4Note")}
                </Typography>
              </Typography>
              {entries.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                    ml: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto 200px",
                      alignItems: "center",
                      gap: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Chip
                      label={t("purchaseReceptionWizard.common.required")}
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        bgcolor: "common.white",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                    <Select
                      value={entry.carrier}
                      onChange={(event) =>
                        updateEntry(index, { carrier: event.target.value })
                      }
                      displayEmpty
                      size="small"
                      sx={{
                        minWidth: 200,
                        bgcolor: "common.white",
                        "& .MuiSelect-select": {
                          py: 1.25,
                          fontWeight: entry.carrier ? 600 : 400,
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        {t("purchaseReceptionWizard.deviceCheck.selectCarrier")}
                      </MenuItem>
                      {carrierOptions.map((carrier) => (
                        <MenuItem key={carrier} value={carrier}>
                          {carrier}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      aria-label={t("purchaseReceptionWizard.common.decrease")}
                      onClick={() =>
                        updateEntry(index, {
                          quantity: Math.max(1, entry.quantity - 1),
                        })
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      value={entry.quantity}
                      size="small"
                      sx={quantityFieldSx}
                      onChange={(event) =>
                        updateEntry(index, {
                          quantity: Number(event.target.value) || 1,
                        })
                      }
                    />
                    <IconButton
                      size="small"
                      aria-label={t("purchaseReceptionWizard.common.increase")}
                      onClick={() =>
                        updateEntry(index, { quantity: entry.quantity + 1 })
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <TextField
                    value={entry.memo}
                    onChange={(event) =>
                      updateEntry(index, { memo: event.target.value })
                    }
                    placeholder={t(
                      "purchaseReceptionWizard.deviceCheck.memoPlaceholder",
                    )}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addEntry}
                size="small"
                sx={{ ml: 2 }}
              >
                {t("purchaseReceptionWizard.deviceCheck.addCarrier")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => goTo("staff-confirm")}
          sx={{ minWidth: 140 }}
        >
          {t("purchaseReceptionWizard.common.back")}
        </Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          sx={{ minWidth: 180, fontWeight: 700 }}
        >
          {t("purchaseReceptionWizard.deviceCheck.complete")}
        </Button>
      </Box>
    </Box>
  );
}
