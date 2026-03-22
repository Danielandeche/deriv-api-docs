declare module 'disable-devtool' {
  export interface IDisableDevtoolConfig {
    md5?: string;
    url?: string;
    tkName?: string;
    ondevtoolopen?: (type: number, next: () => void) => void;
    ondevtoolclose?: () => void;
    interval?: number;
    disableMenu?: boolean;
    stopIntervalTime?: number;
    clearIntervalWhenDevOpenTrigger?: boolean;
    detectors?: number[];
    clearLog?: boolean;
    disableSelect?: boolean;
    disableInputSelect?: boolean;
    disableCopy?: boolean;
    disableCut?: boolean;
    disablePaste?: boolean;
    ignore?: Array<string | RegExp> | null | (() => boolean);
    disableIframeParents?: boolean;
    timeOutUrl?: string;
    rewriteHTML?: string;
  }

  export interface IDisableDevtoolResult {
    success: boolean;
    reason: string;
  }

  export interface IDisableDevtool {
    (config?: IDisableDevtoolConfig): IDisableDevtoolResult;
    isRunning: boolean;
    isSuspend: boolean;
    version?: string;
    md5: (value: string) => string;
  }

  const DisableDevtool: IDisableDevtool;

  export default DisableDevtool;
}
