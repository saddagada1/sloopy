import { cn } from "~/utils/shadcn/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface ConfirmModalProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  withTrigger?: boolean;
  trigger?: React.ReactNode;
  cancelDestructive?: boolean;
  confirmDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onCancel,
  onConfirm,
  title,
  message,
  cancelLabel,
  confirmLabel,
  withTrigger,
  trigger,
  cancelDestructive,
  confirmDestructive,
}) => {
  return (
    <AlertDialog defaultOpen={!withTrigger}>
      {withTrigger && (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <h1 className="section-label mb-0">{title ?? "Confirm"}</h1>
        <p className="mono text-xxs text-muted-foreground lg:text-xs">
          {message ?? "This action cannot be undone."}
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onCancel && onCancel()}
            className={cn("mono h-10", cancelDestructive && "bg-destructive")}
          >
            {cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm && onConfirm()}
            className={cn("mono h-10", confirmDestructive && "bg-destructive")}
          >
            {confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default ConfirmModal;
