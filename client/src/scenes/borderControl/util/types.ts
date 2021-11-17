export type TWithCrossingDialogProps<T = unknown> = T & {
    user: string;
    onClosed: () => void;
};
