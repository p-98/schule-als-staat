import { createSnackbarQueue } from "Components/material/snackbar";

const rmwcQueue = createSnackbarQueue();

export const { messages, notify } = rmwcQueue;

export const notifyUnexpectedError = () =>
    rmwcQueue.notify({
        icon: "error",
        title: <b>Unerwarteter Fehler</b>,
        body: "Bitte versuche es später erneut.",
        dismissesOnAction: true,
        actions: [{ title: "Schließen" }],
    });
