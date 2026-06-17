import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import WorkIcon from "@mui/icons-material/Work";
import { useTranslation } from "react-i18next";
import { useBuyback } from "../../context/BuybackContext";
import { GENDER_OPTIONS, OCCUPATION_OPTIONS } from "../../types";

function RequiredChip() {
  const { t } = useTranslation();

  return (
    <Chip
      label={t("buybackConsentWizard.common.required")}
      size="small"
      color="error"
      sx={{
        height: 24,
        fontSize: "0.75rem",
        fontWeight: 800,
        borderRadius: 1.25,
      }}
    />
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: "primary.50",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
        {title}
      </Typography>
    </Box>
  );
}

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "286px minmax(0, 1fr)" },
        gap: { xs: 1.25, md: 3 },
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          minHeight: 68,
          px: 3,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "grey.50",
          border: "1px solid",
          borderColor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: "1.08rem",
            whiteSpace: "nowrap",
            color: "text.primary",
          }}
        >
          {label}
        </Typography>

        {required && <RequiredChip />}
      </Box>

      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

const inputSx = {
  "& .MuiInputBase-root": {
    height: 60,
    borderRadius: 2,
    bgcolor: "background.paper",
    fontSize: "1rem",
  },
  "& .MuiInputBase-input": {
    px: 2.5,
  },
  "& .MuiInputLabel-root": {
    fontWeight: 700,
  },
};

export function ConsentStep5() {
  const { personalInfo, updatePersonalInfo, goTo } = useBuyback();
  const { t } = useTranslation();

  const isValid =
    personalInfo.lastName.trim() &&
    personalInfo.firstName.trim() &&
    personalInfo.birthDate.trim() &&
    personalInfo.postalCode.trim() &&
    personalInfo.city.trim() &&
    personalInfo.gender &&
    personalInfo.occupation;

  const optionLabel = (group: "gender" | "occupation", value: string) =>
    t(`buybackConsentWizard.${group}.${value}`, { defaultValue: value });

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
      }}
    >
      <Box
        sx={{
          px: { xs: 2.5, md: 5 },
          py: 2,
          flexShrink: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25 }}>
          {t("buybackConsentWizard.consentStep5.instruction")}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {t("buybackConsentWizard.common.required")}
          {t("buybackConsentWizard.consentStep5.requiredInstruction", {
            defaultValue: "項目を入力してください。",
          })}
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 2.5, md: 5 },
          py: { xs: 2.5, md: 3 },
        }}
      >
        <Stack spacing={2.5} sx={{ maxWidth: 1240, mx: "auto" }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <SectionTitle
              icon={<PersonIcon fontSize="small" />}
              title={t("buybackConsentWizard.field.name")}
            />

            <Stack spacing={2.5}>
              <FieldRow label={t("buybackConsentWizard.field.name")} required>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label={t("buybackConsentWizard.field.lastName")}
                    value={personalInfo.lastName}
                    onChange={(e) =>
                      updatePersonalInfo({ lastName: e.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />

                  <TextField
                    fullWidth
                    label={t("buybackConsentWizard.field.firstName")}
                    value={personalInfo.firstName}
                    onChange={(e) =>
                      updatePersonalInfo({ firstName: e.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />
                </Box>
              </FieldRow>

              <FieldRow
                label={t("buybackConsentWizard.field.birthDate")}
                required
              >
                <TextField
                  label={t("buybackConsentWizard.field.birthDate")}
                  value={personalInfo.birthDate}
                  onChange={(e) =>
                    updatePersonalInfo({ birthDate: e.target.value })
                  }
                  placeholder={t("buybackConsentWizard.placeholder.birthDate")}
                  size="small"
                  sx={{ width: { xs: "100%", sm: 390 }, ...inputSx }}
                />
              </FieldRow>

              <FieldRow label={t("buybackConsentWizard.field.gender")} required>
                <RadioGroup
                  row
                  value={personalInfo.gender}
                  onChange={(e) =>
                    updatePersonalInfo({ gender: e.target.value })
                  }
                  sx={{
                    gap: 1.5,
                    minHeight: 60,
                    alignItems: "center",
                  }}
                >
                  {GENDER_OPTIONS.map((opt) => {
                    const selected = personalInfo.gender === opt;

                    return (
                      <FormControlLabel
                        key={opt}
                        value={opt}
                        control={<Radio size="small" />}
                        label={optionLabel("gender", opt)}
                        sx={{
                          m: 0,
                          minWidth: 140,
                          height: 48,
                          px: 1.75,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: selected ? "primary.main" : "divider",
                          bgcolor: selected ? "primary.50" : "background.paper",
                          transition: "all 0.18s ease",
                          "& .MuiFormControlLabel-label": {
                            fontWeight: selected ? 800 : 600,
                            fontSize: "0.95rem",
                          },
                        }}
                      />
                    );
                  })}
                </RadioGroup>
              </FieldRow>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <SectionTitle
              icon={<HomeOutlinedIcon fontSize="small" />}
              title={t("buybackConsentWizard.field.address")}
            />

            <FieldRow label={t("buybackConsentWizard.field.address")} required>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "220px 220px minmax(0, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    label={t("buybackConsentWizard.field.postalCode", {
                      defaultValue: t(
                        "buybackConsentWizard.placeholder.postalCode",
                      ),
                    })}
                    value={personalInfo.postalCode}
                    onChange={(e) =>
                      updatePersonalInfo({ postalCode: e.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />

                  <TextField
                    fullWidth
                    label={t("buybackConsentWizard.field.prefecture")}
                    value={personalInfo.prefecture}
                    onChange={(e) =>
                      updatePersonalInfo({ prefecture: e.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />

                  <TextField
                    fullWidth
                    label={t("buybackConsentWizard.field.city")}
                    value={personalInfo.city}
                    onChange={(e) =>
                      updatePersonalInfo({ city: e.target.value })
                    }
                    size="small"
                    sx={inputSx}
                  />
                </Box>

                <TextField
                  fullWidth
                  label={t("buybackConsentWizard.field.streetAddress")}
                  value={personalInfo.address}
                  onChange={(e) =>
                    updatePersonalInfo({ address: e.target.value })
                  }
                  size="small"
                  sx={inputSx}
                />

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    borderRadius: 2,
                    fontWeight: 700,
                    height: 40,
                  }}
                >
                  {t("buybackConsentWizard.action.addAddress")}
                </Button>
              </Stack>
            </FieldRow>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <SectionTitle
              icon={<WorkIcon fontSize="small" />}
              title={t("buybackConsentWizard.field.occupation")}
            />

            <FieldRow
              label={t("buybackConsentWizard.field.occupation")}
              required
            >
              <FormControl
                size="small"
                sx={{
                  width: { xs: "100%", sm: 390 },
                  "& .MuiInputLabel-root": {
                    fontWeight: 700,
                  },
                  "& .MuiInputBase-root": {
                    height: 60,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  },
                  "& .MuiSelect-select": {
                    px: 2.5,
                    fontSize: "1rem",
                  },
                }}
              >
                <InputLabel>
                  {t("buybackConsentWizard.field.occupation")}
                </InputLabel>

                <Select
                  value={personalInfo.occupation}
                  label={t("buybackConsentWizard.field.occupation")}
                  onChange={(e) =>
                    updatePersonalInfo({ occupation: e.target.value })
                  }
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {t("buybackConsentWizard.placeholder.select")}
                  </MenuItem>

                  {OCCUPATION_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {optionLabel("occupation", opt)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldRow>
          </Paper>
        </Stack>
      </Box>

      <Box
        sx={{
          px: { xs: 3, md: 5 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "flex-end",
          flexShrink: 0,
          bgcolor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          size="large"
          disabled={!isValid}
          onClick={() => goTo("signature")}
          sx={{
            minWidth: 180,
            height: 52,
            fontSize: "1rem",
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          {t("buybackConsentWizard.common.register")}
        </Button>
      </Box>
    </Box>
  );
}
