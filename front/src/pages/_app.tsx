import type {AppProps} from 'next/app'
import {SocketProvider} from "@/context/SocketContext";
import React from "react";

export default function MyApp({Component, pageProps}: AppProps) {
    return (
        <SocketProvider>
            <Component {...pageProps} />
        </SocketProvider>
    )
}