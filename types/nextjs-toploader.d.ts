declare module 'nextjs-toploader' {
    import * as React from 'react';

    export interface NextTopLoaderProps {
        /**
         * Color for the TopLoader.
         * @default "#29D"
         */
        color?: string;
        /**
         * The initial position for the TopLoader in percentage, 0.08 is 8%.
         * @default 0.08
         */
        initialPosition?: number;
        /**
         * The crawl speed for the TopLoader.
         * @default 200
         */
        crawlSpeed?: number;
        /**
         * The speed for the TopLoader.
         * @default 200
         */
        speed?: number;
        /**
         * The easing for the TopLoader.
         * @default "ease"
         */
        easing?: string;
        /**
         * The height for the TopLoader in px.
         * @default 3
         */
        height?: number;
        /**
         * Whether to show the crawl animation.
         * @default true
         */
        crawl?: boolean;
        /**
         * Whether to show the spinner.
         * @default true
         */
        showSpinner?: boolean;
        /**
         * The shadow for the TopLoader.
         * @default "0 0 10px #29D, 0 0 5px #29D"
         */
        shadow?: string | false;
        /**
         * The template for the TopLoader.
         */
        template?: string;
        /**
         * The zIndex for the TopLoader.
         * @default 1600
         */
        zIndex?: number;
        /**
         * Whether to show the TopLoader at the bottom.
         * @default false
         */
        showAtBottom?: boolean;
    }

    const NextTopLoader: React.FC<NextTopLoaderProps>;

    export default NextTopLoader;
}
