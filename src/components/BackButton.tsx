import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import { Button } from "./Button";

interface BackButtonProps {
  path?: string;
  className?: string;
}

export const BackButton = ({ path = "/", className = "" }: BackButtonProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Button variant="back" onClick={() => navigate(path)} className={className}>
      ← {t.form.back}
    </Button>
  );
};
