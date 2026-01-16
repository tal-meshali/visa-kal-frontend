import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import { Button } from "./Button";

interface BackButtonProps {
  path?: string;
  className?: string;
  onClick?: () => void;
}

export const BackButton = ({
  path = "/",
  className = "",
  onClick,
}: BackButtonProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
  };

  return (
    <Button variant="back" onClick={handleClick} className={className}>
      ← {t.form.back}
    </Button>
  );
};
