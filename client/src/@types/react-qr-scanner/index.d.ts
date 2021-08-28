// Type definitions for react-qr-scanner 1.0.0-alpha.7
// Project: schule-als-staat
// Definitions by: Timon Martins

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('react-qr-scanner');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from 'react-qr-scanner';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

import * as React from "react";

declare const ReactQRScanner: React.FC<ReactQRScanner.IProps>;
export = ReactQRScanner;

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare namespace ReactQRScanner {
    interface IReactQRScannerProps {
        onScan: (data: string | null) => void;
        onError: (err: Error) => void;
        onLoad?: () => void;
        onImageLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
        delay?: number | false;
        facingMode?: "front" | "rear";
        legacyMode?: boolean;
        maxImageSize?: number;
        style?: Partial<React.CSSProperties>;
        /** ClassName for the container element. */
        className?: string;
        chooseDeviceId?: (
            facingModeDevices: unknown,
            allDevices: unknown[]
        ) => void;
        className?: string;
        initialStream?: MediaStream;
    }
}
