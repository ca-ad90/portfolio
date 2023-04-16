import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Views from "./views";
import { AnimatePresence } from "framer-motion";

export default function AnimateRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes key={location.pathname} location={location}>
                {/**
                 * TODO
                 * create list Path Map
                 */}
                <Route path="/" element={<Views.Home />} />
                <Route path="/portfolio" element={<Views.Portfolio />} />
            </Routes>
        </AnimatePresence>
    );
}
