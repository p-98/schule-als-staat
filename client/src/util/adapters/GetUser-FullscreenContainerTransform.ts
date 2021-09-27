/* eslint-disable import/prefer-default-export */
// local
import { TOnAfterCloneHandle } from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";

import loginStyles from "Components/login/login.module.css";

export const onAfterCloneHandle: TOnAfterCloneHandle = (
    handleDOM,
    portalHandleDOM,
    action,
    msToTransformEnd
) => {
    const videoDOM = handleDOM.getElementsByTagName(
        "video"
    )[0] as HTMLVideoElement;
    const portalVideo = portalHandleDOM.getElementsByTagName(
        "video"
    )[0] as HTMLVideoElement;

    if (action === "opening") {
        // replace video with image displaying current the current video frame
        const imgCanvas = document.createElement("canvas");
        imgCanvas.classList.add(loginStyles["login__qr-video"] as string);
        imgCanvas.width = videoDOM.videoWidth;
        imgCanvas.height = videoDOM.videoHeight;

        const imgContext = imgCanvas.getContext("2d");
        imgContext?.drawImage(videoDOM, 0, 0);

        portalVideo.replaceWith(imgCanvas);
    }

    if (action === "closing") {
        // fade in video after transform has finished
        videoDOM.style.opacity = "0";
        const transitionTime = msToTransformEnd;
        // 200ms decelerated easing
        videoDOM.style.transition = `opacity 250ms cubic-bezier(0.0, 0.0, 0.2, 1)`;

        setTimeout(() => {
            videoDOM.style.opacity = "1";
        }, msToTransformEnd);

        setTimeout(() => {
            videoDOM.style.opacity = "";
            videoDOM.style.transition = "";
        }, msToTransformEnd + transitionTime);
    }
};
